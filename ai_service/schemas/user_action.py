from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UserAction(BaseModel):
    customer_id: str
    action_type: Optional[str]
    product_id: Optional[str]
    category: Optional[str]
    timestamp: Optional[int] = None
