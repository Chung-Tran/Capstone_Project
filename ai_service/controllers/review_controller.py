from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict
from bson import ObjectId
from datetime import datetime
from services.review_analysis import analyze_reviews
from fastapi import APIRouter

router = APIRouter()

class AnalyzeRequest(BaseModel):
    store_id: str
    product_list: List[str]
    log_date: datetime

@router.post("/reviews/analyze")
async def analyze(request: AnalyzeRequest) -> Dict:
    try:
        result = await analyze_reviews(
            store_id=request.store_id,
            product_ids=request.product_list,
            log_date=request.log_date
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing reviews: {str(e)}")