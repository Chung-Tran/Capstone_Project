# services/recommendation.py
from datetime import datetime, timedelta
from bson import ObjectId
from typing import List, Dict, Optional
from utils.user_behavior_analyzer import UserBehaviorAnalyzer
from database.mongo import recommendation_collection

# Khởi tạo analyzer
analyzer = UserBehaviorAnalyzer()

async def analyze_and_save_user_recommendation(user_id: str, analysis_days: int = 30) -> bool:
    """Phân tích user behavior và lưu vào recommendation collection"""
    try:
        # Phân tích user behavior
        recommendation_data = await analyzer.analyze_user_behavior(user_id, analysis_days)
        
        # Lưu vào database
        await recommendation_collection.update_one(
            {"customer_id": ObjectId(user_id)},
            {"$set": recommendation_data},
            upsert=True
        )
        
        print(f"✅ Analyzed and saved recommendation data for user {user_id}")
        return True
        
    except Exception as e:
        print(f"❌ Error analyzing user {user_id}: {str(e)}")
        return False

async def get_user_recommendation_data(customer_id: str) -> Optional[Dict]:
    """Lấy dữ liệu recommendation của user để query sản phẩm"""
    try:
        recommendation = await recommendation_collection.find_one(
            {"customer_id": ObjectId(customer_id)}
        )
        
        if recommendation:
            # Convert ObjectId to string for JSON response
            recommendation["_id"] = str(recommendation["_id"])
            recommendation["customer_id"] = str(recommendation["customer_id"])
            
            # Convert product_ids ObjectId to string if exists
            if recommendation.get("product_ids"):
                recommendation["product_ids"] = [
                    str(pid) for pid in recommendation["product_ids"]
                ]
        
        return recommendation
        
    except Exception as e:
        print(f"❌ Error getting recommendation data for user {customer_id}: {str(e)}")
        return None

async def batch_analyze_users(user_ids: List[str], analysis_days: int = 30) -> str:
    """Phân tích nhiều users cùng lúc"""
    success_count = 0
    failed_users = []
    
    for user_id in user_ids:
        success = await analyze_and_save_user_recommendation(user_id, analysis_days)
        if success:
            success_count += 1
        else:
            failed_users.append(user_id)
    
    result_msg = f"✅ Analyzed {success_count}/{len(user_ids)} users successfully."
    
    if failed_users:
        result_msg += f" Failed users: {', '.join(failed_users[:5])}"
        if len(failed_users) > 5:
            result_msg += f" and {len(failed_users) - 5} more..."
    
    return result_msg

async def get_user_keywords(customer_id: str, limit: int = 10) -> List[str]:
    """Lấy keywords recommendation cho user"""
    try:
        data = await get_user_recommendation_data(customer_id)
        if data and data.get("keywords"):
            return data["keywords"][:limit]
        return []
    except Exception as e:
        print(f"❌ Error getting keywords for user {customer_id}: {str(e)}")
        return []

async def get_user_categories(customer_id: str, limit: int = 5) -> List[str]:
    """Lấy categories recommendation cho user"""
    try:
        data = await get_user_recommendation_data(customer_id)
        if data and data.get("categories"):
            return data["categories"][:limit]
        return []
    except Exception as e:
        print(f"❌ Error getting categories for user {customer_id}: {str(e)}")
        return []

async def get_user_brands(customer_id: str, limit: int = 5) -> List[str]:
    """Lấy brands recommendation cho user"""
    try:
        data = await get_user_recommendation_data(customer_id)
        if data and data.get("brands"):
            return data["brands"][:limit]
        return []
    except Exception as e:
        print(f"❌ Error getting brands for user {customer_id}: {str(e)}")
        return []

async def get_user_price_range(customer_id: str) -> Dict[str, float]:
    """Lấy price range preference của user"""
    try:
        data = await get_user_recommendation_data(customer_id)
        if data and data.get("price_range"):
            return data["price_range"]
        return {"min": 0, "max": 0, "avg": 0}
    except Exception as e:
        print(f"❌ Error getting price range for user {customer_id}: {str(e)}")
        return {"min": 0, "max": 0, "avg": 0}

async def get_user_behavior_analysis(customer_id: str) -> Dict:
    """Lấy behavior analysis của user"""
    try:
        data = await get_user_recommendation_data(customer_id)
        if data and data.get("behavior_analysis"):
            return data["behavior_analysis"]
        return {
            "most_active_time": "00:00",
            "preferred_action": "view_product", 
            "engagement_score": 0.0,
            "purchase_intent": "Low"
        }
    except Exception as e:
        print(f"❌ Error getting behavior analysis for user {customer_id}: {str(e)}")
        return {
            "most_active_time": "00:00",
            "preferred_action": "view_product",
            "engagement_score": 0.0, 
            "purchase_intent": "Low"
        }