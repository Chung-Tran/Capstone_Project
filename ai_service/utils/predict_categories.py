# utils/product_prediction.py
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import json
import os
import joblib
from loguru import logger

class CategoriesRecommender:
    def __init__(self, model_dir="./models/predict_event_categories"):
        """
        Khởi tạo ProductRecommender
        
        Args:
            model_dir: Đường dẫn đến thư mục chứa các file mô hình
        """
        self.model_dir = model_dir
        self.load_metadata()
        self.load_model()
        logger.info(f"Initialized ProductRecommender with model from {model_dir}")
    
    def load_metadata(self):
        """Load các file metadata từ thư mục model"""
        try:
            with open(f"{self.model_dir}/category_mapping.json", "r", encoding="utf-8") as f:
                self.category_mapping = json.load(f)
            with open(f"{self.model_dir}/event_mapping.json", "r", encoding="utf-8") as f:
                self.event_mapping = json.load(f)
            self.category_encoder = joblib.load(f"{self.model_dir}/category_encoder.pkl")
            self.event_encoder = joblib.load(f"{self.model_dir}/event_encoder.pkl")
            logger.debug("Loaded metadata files successfully")
        except Exception as e:
            logger.error(f"Error loading metadata: {str(e)}")
            raise RuntimeError(f"Failed to load metadata: {str(e)}")
    
    def load_model(self):
        """Load mô hình từ file pkl"""
        try:
            self.model = joblib.load(f"{self.model_dir}/predict_event_categories.pkl")
            logger.debug("Loaded model successfully")
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            raise RuntimeError(f"Failed to load model: {str(e)}")
    
    def predict_hot_products(self, input_date_str, period=90, top_n=5):
        """
        Dự đoán sản phẩm hot trong khoảng thời gian từ input_date trong period ngày
        
        Args:
            input_date_str: Ngày bắt đầu dự đoán, định dạng YYYY-MM-DD
            period: Số ngày dự đoán
            top_n: Số lượng sản phẩm hot nhất muốn trả về
            
        Returns:
            List của dict, mỗi dict chứa category, event và count
        """
        try:
            input_date = pd.to_datetime(input_date_str)
        except ValueError:
            raise ValueError(f"Invalid date format: {input_date_str}. Please use YYYY-MM-DD format.")
        
        logger.info(f"Predicting hot products from {input_date_str} for {period} days")
        
        # Tạo danh sách các ngày cần dự đoán
        future_dates = pd.date_range(start=input_date, periods=period, freq="D")
        future = pd.DataFrame({
            "Date": future_dates,
            "Month": [d.month for d in future_dates],
            "Day": [d.day for d in future_dates],
            "DayOfWeek": [d.weekday() for d in future_dates]
        })
        
        # Dự đoán sử dụng model
        X_future = future[["Month", "Day", "DayOfWeek"]]
        predictions = self.model.predict(X_future)
        
        # Chuyển đổi mã hóa về tên thể loại và sự kiện
        predicted_categories = self.category_encoder.inverse_transform(predictions[:, 0])
        predicted_events = self.event_encoder.inverse_transform(predictions[:, 1])
        
        # Kết hợp dự đoán với ngày tương ứng
        results = []
        for i, (date, category, event) in enumerate(zip(future_dates, predicted_categories, predicted_events)):
            # Chỉ thêm những dự đoán có sự kiện và thể loại không phải "None"
            if category != "None" and event != "None":
                results.append({
                    "date": date.strftime("%Y-%m-%d"),
                    "category": category, 
                    "event": event
                })
        
        # Log kết quả dự đoán chi tiết để dễ debug
        logger.debug(f"Raw prediction results: {len(results)} items")
        
        # Nếu không có kết quả, trả về danh sách trống
        if not results:
            logger.warning("No matching events/categories found in prediction period")
            return []
        
        # Nhóm theo thể loại và sự kiện để lấy top N
        result_df = pd.DataFrame(results)
        top_results = result_df.groupby(["category", "event"]).size().reset_index(name="count")
        top_results = top_results.sort_values("count", ascending=False).head(top_n)
        
        # Format kết quả trả về
        output = [
            {"category": row["category"], "event": row["event"], "count": int(row["count"])}
            for _, row in top_results.iterrows()
        ]
        
        logger.info(f"Predicted {len(output)} hot products")
        return output