# utils/user_behavior_analyzer.py
from datetime import datetime, timedelta
from bson import ObjectId
from collections import Counter, defaultdict
from typing import List, Dict
from database.mongo import user_action_collection, product_collection

class UserBehaviorAnalyzer:
    def __init__(self):
        self.ACTION_WEIGHTS = {
            "view_product": 1,
            "click_product": 2,
            "add_to_cart": 4,
            "add_to_wishlist": 3,
            "purchase": 10
        }
    
    async def analyze_user_behavior(self, user_id: str, analysis_days: int = 30) -> Dict:
        """Phân tích behavior của user và tạo dữ liệu cho recommendation"""
        
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=analysis_days)
        
        # 1. Lấy tất cả user actions trong khoảng thời gian
        user_actions = await self._get_user_actions(user_id, start_date, end_date)
        
        if not user_actions:
            return self._create_empty_recommendation(user_id, start_date, end_date, analysis_days)
        
        # 2. Lấy thông tin chi tiết sản phẩm
        product_details = await self._get_product_details(user_actions)
        
        # 3. Phân tích và tạo dữ liệu recommendation
        recommendation_data = await self._create_recommendation_data(
            user_id, user_actions, product_details, start_date, end_date, analysis_days
        )
        
        return recommendation_data
    
    async def _get_user_actions(self, user_id: str, start_date: datetime, end_date: datetime) -> List[Dict]:
        """Lấy user actions trong khoảng thời gian"""
        cursor = user_action_collection.find({
            "customer_id": ObjectId(user_id),
            "action_type": {"$in": list(self.ACTION_WEIGHTS.keys())}
        })
        
        actions = await cursor.to_list(length=None)
        print(f"📊 Found {len(actions)} actions for user {user_id}")
        return actions
    
    async def _get_product_details(self, user_actions: List[Dict]) -> Dict:
        """Lấy thông tin chi tiết của các sản phẩm user tương tác"""
        """Lấy thông tin chi tiết của các sản phẩm user tương tác"""

        def safe_objectid(value):
            try:
                return ObjectId(value)
            except (errors.InvalidId, TypeError):
                return None

        product_ids = list(set(filter(None, [safe_objectid(action["product_id"]) for action in user_actions])))

        cursor = product_collection.find(
            {"_id": {"$in": product_ids}},
            {
                "name": 1, "category": 1, "brand": 1, "price": 1, 
                "keywords": 1, "tags": 1, "description": 1
            }
        )
        
        products = await cursor.to_list(length=None)
        print("products",product_ids,products)
        print(f"📦 Found details for {len(products)} products")
        return {str(p["_id"]): p for p in products}
    
    async def _create_recommendation_data(
        self, user_id: str, user_actions: List[Dict], 
        product_details: Dict, start_date: datetime, 
        end_date: datetime, analysis_days: int
    ) -> Dict:
        """Tạo dữ liệu recommendation từ phân tích user behavior"""
        
        # Phân tích categories với trọng số
        category_scores = defaultdict(float)
        brand_scores = defaultdict(float)
        keyword_scores = defaultdict(float)
        price_list = []
        action_counts = defaultdict(int)
        hourly_activity = defaultdict(int)
        
        recent_product_ids = []  # Sản phẩm tương tác gần đây
        print("user_actions",product_details)
        for action in user_actions:
            action_type = action["action_type"]
            product_id = str(action["product_id"])
            weight = self.ACTION_WEIGHTS.get(action_type, 1)
            
            # Đếm actions
            action_counts[action_type] += 1
            
            # Thêm product gần đây (top 20)
            if len(recent_product_ids) < 20:
                recent_product_ids.append(action["product_id"])
            
            # Phân tích sản phẩm nếu có thông tin
            if product_id in product_details:
                product = product_details[product_id]
                
                # Categories với trọng số
                if product.get("category"):
                    category_scores[product["category"]] += weight
                
                # Brands với trọng số  
                if product.get("brand"):
                    brand_scores[product["brand"]] += weight
                
                # Keywords/Tags với trọng số
                keywords = []
                if product.get("keywords"):
                    if isinstance(product["keywords"], list):
                        keywords.extend(product["keywords"])
                    else:
                        keywords.append(product["keywords"])
                
                if product.get("tags"):
                    if isinstance(product["tags"], list):
                        keywords.extend(product["tags"])
                    else:
                        keywords.append(product["tags"])
                
                # Extract keywords from name and description
                if product.get("name"):
                    name_words = product["name"].lower().split()
                    keywords.extend([word for word in name_words if len(word) > 3])
                
                for keyword in keywords:
                    if keyword and isinstance(keyword, str):
                        keyword_scores[keyword.lower().strip()] += weight
                
                # Giá sản phẩm
                if product.get("price") and isinstance(product["price"], (int, float)):
                    price_list.append(float(product["price"]))
        
        # Tính toán kết quả phân tích
        
        # 1. Top categories (sắp xếp theo trọng số)
        top_categories = [cat for cat, _ in Counter(category_scores).most_common(10)]
        
        # 2. Top brands
        top_brands = [brand for brand, _ in Counter(brand_scores).most_common(5)]
        
        # 3. Top keywords (lọc bỏ từ không có ý nghĩa)
        filtered_keywords = {
            k: v for k, v in keyword_scores.items() 
            if len(k) > 2 and k not in ['the', 'and', 'for', 'with', 'from', 'this', 'that']
        }
        top_keywords = [kw for kw, _ in Counter(filtered_keywords).most_common(15)]
        
        # 4. Price range analysis
        price_analysis = {"min": 0, "max": 0, "avg": 0}
        if price_list:
            price_analysis = {
                "min": round(min(price_list), 2),
                "max": round(max(price_list), 2), 
                "avg": round(sum(price_list) / len(price_list), 2)
            }
        
        # 5. Behavior analysis
        most_active_hour = max(hourly_activity.items(), key=lambda x: x[1])[0] if hourly_activity else 0
        most_active_time = f"{most_active_hour:02d}:00"
        
        preferred_action = max(action_counts.items(), key=lambda x: x[1])[0] if action_counts else "view_product"
        
        # Tính engagement score
        total_weight = sum(count * self.ACTION_WEIGHTS.get(action, 1) for action, count in action_counts.items())
        engagement_score = min(total_weight / 100.0, 10.0)  # Scale 0-10
        
        # Purchase intent
        purchase_intent = self._calculate_purchase_intent(action_counts)
        
        # Tạo recommendation data
        recommendation_data = {
            "customer_id": ObjectId(user_id),
            
            # Dữ liệu để query
            "keywords": top_keywords,
            "categories": top_categories,
            "brands": top_brands,
            "price_range": price_analysis,
            
            # Metadata phân tích
            "behavior_analysis": {
                "most_active_time": most_active_time,
                "preferred_action": preferred_action,
                "engagement_score": round(engagement_score, 2),
                "purchase_intent": purchase_intent,
            },
            
            # Thống kê
            "statistics": {
                "total_views": action_counts.get("view_product", 0),
                "total_clicks": action_counts.get("click_product", 0),
                "total_cart_adds": action_counts.get("add_to_cart", 0),
                "total_wishlist_adds": action_counts.get("add_to_wishlist", 0),
                "total_purchases": action_counts.get("purchase", 0),
            },
            
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "analysis_period": {
                "from_date": start_date,
                "to_date": end_date,
                "days": analysis_days
            }
        }
        return recommendation_data
    
    def _calculate_purchase_intent(self, action_counts: Dict) -> str:
        """Tính toán purchase intent dựa trên hành vi user"""
        purchases = action_counts.get("purchase", 0)
        cart_adds = action_counts.get("add_to_cart", 0)
        wishlist_adds = action_counts.get("add_to_wishlist", 0)
        total_actions = sum(action_counts.values())
        
        if purchases > 0:
            if purchases / total_actions > 0.1:  # >10% actions là purchase
                return "High"
            else:
                return "Medium"
        elif cart_adds > 3 or wishlist_adds > 2:
            return "Medium"
        elif cart_adds > 0 or wishlist_adds > 0:
            return "Low"
        else:
            return "Very Low"
    
    def _create_empty_recommendation(self, user_id: str, start_date: datetime, end_date: datetime, days: int) -> Dict:
        """Tạo recommendation data rỗng cho user không có activity"""
        print(f"⚠️ No activity found for user {user_id}")
        
        return {
            "customer_id": ObjectId(user_id),
            "keywords": [],
            "categories": [],
            "brands": [],
            "product_ids": [],
            "price_range": {"min": 0, "max": 0, "avg": 0},
            "behavior_analysis": {
                "most_active_time": "00:00",
                "preferred_action": "view_product",
                "engagement_score": 0.0,
                "purchase_intent": "Very Low",
            },
            "statistics": {
                "total_views": 0, "total_clicks": 0, "total_cart_adds": 0,
                "total_wishlist_adds": 0, "total_purchases": 0,
                "last_activity_date": datetime.utcnow(),
                "days_active": 0
            },
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "analysis_period": {"from_date": start_date, "to_date": end_date, "days": days}
        }