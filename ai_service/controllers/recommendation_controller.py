from fastapi import APIRouter, HTTPException
from services.recommendation import get_recommendation_product_ids, retrain_recommendation_model, get_recommendation_keywords

router = APIRouter()

@router.post("/recommend/retrain-model")
async def retrain():
    msg = await retrain_recommendation_model()
    return {"message": msg}

@router.get("/recommend/{customer_id}")
async def recommend(customer_id: str, top_n: int = 10):
    try:
        product_ids = await get_recommendation_product_ids(customer_id, top_n)
        return {
            "customer_id": customer_id,
            "recommended_product_ids": product_ids
        }
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Model not found.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/recommend-keywords/{customer_id}")
async def recommend_keywords(customer_id: str, top_n: int = 10):
    try:
        keywords = await get_recommendation_keywords(customer_id, top_n)
        return {
            "customer_id": customer_id,
            "recommended_keywords": keywords
        }
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Model not found.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
