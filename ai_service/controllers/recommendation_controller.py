from fastapi import APIRouter
from services.recommendation import get_recommendations

router = APIRouter()

@router.get("/recommendations/{user_id}")
async def recommend(user_id: str):
    return await get_recommendations(user_id)
