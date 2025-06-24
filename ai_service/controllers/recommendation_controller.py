# controllers/recommendation.py
from fastapi import APIRouter, HTTPException
from services.recommendation import (
    analyze_and_save_user_recommendation,
    batch_analyze_users,
    get_user_recommendation_data
)
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

class AnalyzeUserRequest(BaseModel):
    user_id: str
    analysis_days: int = 30

class BatchAnalyzeRequest(BaseModel):
    user_ids: List[str]
    analysis_days: int = 30

class GetRecommendationRequest(BaseModel):
    customer_id: str

@router.post("/recommendation/analyze-user")
async def analyze_user_behavior(payload: AnalyzeUserRequest):
    """API để phân tích behavior của 1 user và lưu vào recommendation collection"""
    try:
        success = await analyze_and_save_user_recommendation(
            payload.user_id, payload.analysis_days
        )
        
        if success:
            return {
                "success": True, 
                "message": f"User {payload.user_id} analyzed successfully"
            }
        else:
            return {
                "success": False, 
                "message": "Analysis failed"
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/recommendation/batch-analyze")
async def batch_analyze_users_endpoint(payload: BatchAnalyzeRequest):
    """API để phân tích nhiều users cùng lúc"""
    try:
        result = await batch_analyze_users(
            payload.user_ids, payload.analysis_days
        )
        return {
            "success": True, 
            "message": result
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/recommendation/get-data")
async def get_recommendation_data(payload: GetRecommendationRequest):
    """API để lấy dữ liệu recommendation của user để query sản phẩm"""
    try:
        data = await get_user_recommendation_data(payload.customer_id)
        
        if data:
            return {
                "success": True, 
                "data": data
            }
        else:
            return {
                "success": False, 
                "message": "No recommendation data found"
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/recommendation/user/{customer_id}")
async def get_user_recommendations(customer_id: str):
    """API GET để lấy recommendation data theo customer_id"""
    try:
        data = await get_user_recommendation_data(customer_id)
        
        if data:
            return {
                "success": True,
                "customer_id": customer_id,
                "data": data
            }
        else:
            return {
                "success": False,
                "message": f"No recommendation data found for user {customer_id}"
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))