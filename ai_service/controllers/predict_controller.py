# controllers/product_controller.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime
from services.predict_categories import predict_hot_products
from fastapi import Query

router = APIRouter()
# region // Dự đoán sản phẩm hot dựa trên các sự kiện sắp diễn ra
class HotProductRequest(BaseModel):
    period: Optional[int] = 90  # Số ngày dự đoán
    top_n: Optional[int] = 50  # Số lượng sản phẩm hot nhất muốn trả về

class HotProductResponse(BaseModel):
    categories: List[str]  # do giờ gom nhiều danh mục theo event
    event: str
    dates: List[str]
    frequency: int

@router.post("/predict/event_categories", response_model=List[HotProductResponse])
async def get_hot_products(request: HotProductRequest) -> List[Dict]:
    """
    Dự đoán danh sách sản phẩm hot trong khoảng thời gian tới dựa trên các sự kiện sắp diễn ra.
    """
    try:
        today_str = datetime.utcnow().strftime("%Y-%m-%d")
        # Gọi service để dự đoán
        result = await predict_hot_products(
            input_date=today_str,
            period=request.period,
            top_n=request.top_n
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid input: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error predicting hot products: {str(e)}")

# endregion
