from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class UserAction(BaseModel):
    customer_id: str
    action_type: str
    product_id: Optional[str] = None
    category: Optional[str] = None
    keyword: Optional[str] = None
    timestamp: Optional[int] = None  # Epoch time (sẽ chuyển về datetime trong controller)
