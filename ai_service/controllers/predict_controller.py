# controllers/product_controller.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime
from services.predict_categories import predict_hot_products
from fastapi import Query

router = APIRouter()

class HotProductRequest(BaseModel):
    date: str  # Format YYYY-MM-DD
    period: Optional[int] = 90  # Số ngày dự đoán
    top_n: Optional[int] = 5  # Số lượng sản phẩm hot nhất muốn trả về

class HotProductResponse(BaseModel):
    category: str
    event: str
    count: int

@router.post("/predict/event_categories", response_model=List[HotProductResponse])
async def get_hot_products(request: HotProductRequest) -> List[Dict]:
    """
    Dự đoán danh sách sản phẩm hot trong khoảng thời gian tới dựa trên các sự kiện sắp diễn ra.
    """
    try:
        # Gọi service để dự đoán
        result = await predict_hot_products(
            input_date=request.date,
            period=request.period,
            top_n=request.top_n
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid input: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error predicting hot products: {str(e)}")
