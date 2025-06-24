from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict
from datetime import datetime
from services.review_analysis import analyze_stores_sentiment
router = APIRouter()

class AnalyzeRequest(BaseModel):
    store_ids: List[str]  # Thay đổi từ store_id thành store_ids (list)

@router.post("/reviews/analyze")
async def analyze_stores_comments(request: AnalyzeRequest) -> List[Dict]:
    """
    API endpoint để phân tích comments tiêu cực của các store
    Input: {"store_ids": ["store_id_1", "store_id_2", ...]}
    Output: List các store với comments tiêu cực
    """
    try:
        result = await analyze_stores_sentiment(store_ids=request.store_ids)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing store comments: {str(e)}")