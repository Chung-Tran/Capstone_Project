from datetime import datetime, timedelta
from typing import Dict, List
from utils.sentiment_analysis import analyze_sentiment
from loguru import logger
from database.mongo import review_collection  # Thay đổi từ review_collection thành comment_collection
from bson import ObjectId

async def analyze_stores_sentiment(store_ids: List[str]) -> List[Dict]:
    """
    Phân tích sentiment của comments cho danh sách các store
    
    Args:
        store_ids: Danh sách ID của các store cần phân tích
        
    Returns:
        List các store với thông tin comments tiêu cực
    """
    try:
        # Tính thời gian 7 ngày trước từ hiện tại
        current_time = datetime.now()
        time_threshold = current_time - timedelta(days=7)
        
        result = []
        
        for store_id in store_ids:
            try:
                logger.info(f"Analyzing comments for store: {store_id}")
                
                # Query comments cho store_id trong 7 ngày gần nhất
                cursor = review_collection.find(
                    {
                        "store_id": ObjectId(store_id),
                        "created_at": {"$gte": time_threshold, "$lte": current_time}
                    },
                    {"_id": 1, "content": 1,"customer_id": 1, "created_at": 1,"product_id":1}  # Lấy thêm _id theo yêu cầu
                )
                comments = await cursor.to_list(length=None)
                
                if not comments:
                    logger.info(f"No recent comments found for store {store_id}")
                    result.append({
                        "store_id": store_id,
                        "negative_comments": []
                    })
                    continue
                
                negative_comments = []
                
                for comment in comments:
                    comment_id = comment.get("_id")
                    content = comment.get("content")
                    customer_id = comment.get("customer_id")
                    product_id = comment.get("product_id")
                    created_at = comment.get("created_at")
                    
                    # Kiểm tra dữ liệu hợp lệ
                    if not content or not isinstance(content, str) or content.strip() == "":
                        logger.warning(f"Invalid comment content for store {store_id}: {content}")
                        continue
                    
                    if not comment_id or not created_at:
                        logger.warning(f"Missing comment_id or created_at for store {store_id}")
                        continue
                    
                    try:
                        # Phân tích sentiment
                        sentiment, confidence = analyze_sentiment(content)
                        logger.debug(f"Comment {comment_id}: Sentiment={sentiment}, Confidence={confidence:.4f}")
                        
                        # Chỉ lấy comments tiêu cực
                        if sentiment.lower() == "negative":
                            negative_comments.append({
                                "content": content,
                                "customer_id": str(customer_id),
                                "product_id": str(product_id),
                                "sentiment": "negative",
                                "_id": str(comment_id),  # Convert ObjectId to string
                                "confidence": round(confidence, 4),  # Thêm confidence score
                                "created_at": created_at.isoformat()  # Thêm thời gian tạo
                            })
                            
                    except Exception as e:
                        logger.error(f"Error analyzing sentiment for comment {comment_id} in store {store_id}: {str(e)}")
                        continue
                
                # Thêm kết quả cho store
                store_result = {
                    "store_id": store_id,
                    "negative_comments": negative_comments
                }
                
                # Log thông tin tổng kết
                total_comments = len(comments)
                negative_count = len(negative_comments)
                logger.info(f"Store {store_id}: {negative_count}/{total_comments} negative comments found")
                
                result.append(store_result)
                
            except Exception as e:
                logger.error(f"Error analyzing comments for store {store_id}: {str(e)}")
                # Vẫn thêm store vào kết quả với danh sách rỗng khi có lỗi
                result.append({
                    "store_id": store_id,
                    "negative_comments": [],
                    "error": str(e)
                })
        
        logger.info(f"Completed sentiment analysis for {len(store_ids)} stores")
        return result
        
    except Exception as e:
        logger.error(f"Error in analyze_stores_sentiment: {str(e)}")
        # Trả về danh sách rỗng khi có lỗi tổng thể
        return [{"store_id": store_id, "negative_comments": [], "error": str(e)} for store_id in store_ids]
