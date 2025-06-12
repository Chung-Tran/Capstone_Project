from models.recommendation.trainer import train_model
from models.recommendation.recommender import recommend_product_ids,recommend_keywords


async def retrain_recommendation_model():
    return await train_model()


async def get_recommendation_product_ids(customer_id: str, top_n: int = 10):
    return await recommend_product_ids(customer_id, top_n)


async def get_recommendation_keywords(customer_id: str, top_n: int = 10):
    return await recommend_keywords(customer_id, top_n)
