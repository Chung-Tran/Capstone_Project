from typing import List, Dict
from prophet import Prophet
import pandas as pd
from loguru import logger

async def forecast_inventory_status(store_id: str, products: List) -> Dict:
    result = {
        "store_id": store_id,
        "low_inventory_products": []
    }

    for product in products:
        try:
            product_id = product.product_id
            history = product.sales_history
            current_stock = product.current_stock
            minimum_stock = product.minimum_stock

            if len(history) < 7:
                logger.warning(f"Not enough sales data for product {product_id}")
                continue

            # Convert sales_history to DataFrame
            df = pd.DataFrame([{
                "ds": record.date,
                "y": record.quantity
            } for record in history])

            model = Prophet(daily_seasonality=True)
            model.fit(df)

            future = model.make_future_dataframe(periods=5)
            forecast = model.predict(future)

            forecast_5_days = forecast.tail(5)
            predicted_sales = forecast_5_days["yhat"].sum()

            if current_stock < predicted_sales or current_stock < minimum_stock:
                result["low_inventory_products"].append({
                    "product_id": product_id,
                    "predicted_sales_5_days": round(predicted_sales, 2),
                    "current_stock": current_stock,
                    "minimum_stock": minimum_stock
                })

        except Exception as e:
            logger.error(f"Error forecasting for product {product_id}: {str(e)}")
            continue

    return result
