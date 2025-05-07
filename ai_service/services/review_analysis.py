from datetime import datetime, timedelta
from typing import Dict, List
from utils.sentiment_analysis import analyze_sentiment
from loguru import logger
from database.mongo import review_collection
from bson import ObjectId

async def analyze_reviews(store_id: str, product_ids: List[str], log_date: datetime) -> Dict:
    try:
        # Tính thời gian bắt đầu từ log_date, lấy bình luận trong 3 ngày trước
        time_threshold = log_date - timedelta(days=3)
        
        result = {
            "store_id": store_id,
            "product_list": []
        }

        for product_id in product_ids:
            try:
                # Query bình luận cho product_id, lọc theo thời gian
                cursor = review_collection.find(
                    {
                        "product_id": ObjectId(product_id),
                        # "store_id": ObjectId(store_id),
                        # "created_at": {"$gte": time_threshold, "$lte": log_date}
                    },
                    {"_id": 0, "content": 1, "rating": 1, "created_at": 1}
                )
                reviews = await cursor.to_list(length=None)

                if not reviews:
                    logger.info(f"No recent reviews for product {product_id} in store {store_id}")
                    result["product_list"].append({
                        "product_id": product_id,
                        "negativeCount": 0,
                        "negative_comments": []
                    })
                    continue

                negative_comments = []

                for review in reviews:
                    text = review.get("content")
                    rating = review.get("rating")
                    created_at = review.get("created_at")

                    # Kiểm tra dữ liệu hợp lệ
                    if text is None or not isinstance(text, str) or text.strip() == "":
                        logger.warning(f"Invalid review content for product {product_id}: {text}")
                        continue
                    if rating is None or created_at is None:
                        logger.warning(f"Missing rating or created_at for product {product_id}")
                        continue

                    try:
                        sentiment, confidence = analyze_sentiment(text)
                        print(f"Sentiment: {sentiment}, Confidence: {confidence}")
                        if sentiment == "Negative":
                            negative_comments.append({
                                "text": text,
                                "rating": rating,
                                "created_at": created_at.isoformat(),
                                "sentiment_score": confidence
                            })
                    except Exception as e:
                        logger.error(f"Error processing review for product {product_id}: {str(e)}")
                        continue

                result["product_list"].append({
                    "product_id": product_id,
                    "negativeCount": len(negative_comments),
                    "negative_comments": negative_comments
                })

            except Exception as e:
                logger.error(f"Error analyzing reviews for product {product_id}: {str(e)}")
                result["product_list"].append({
                    "product_id": product_id,
                    "negativeCount": 0,
                    "negative_comments": [],
                    "error": str(e)
                })

        return result

    except Exception as e:
        logger.error(f"Error analyzing reviews for store {store_id}: {str(e)}")
        return {
            "store_id": store_id,
            "product_list": [],
            "error": str(e)
        }