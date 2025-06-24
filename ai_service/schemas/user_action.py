from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class UserAction(BaseModel):
    customer_id: str
    action_type: str
    product_id: Optional[str] = None
    store_id: Optional[str] = None  # ✅ thêm dòng này
    category: Optional[str] = None
    keyword: Optional[str] = None
    priceRange: Optional[str] = None  # ✅ thêm dòng này nếu cần
    description: Optional[str] = None  
    created_at: Optional[str] = None  # ✅ đổi từ int → str (nếu client gửi ISO string)
    timestamp: Optional[int] = None  # vẫn giữ nếu bạn muốn xử lý epoch