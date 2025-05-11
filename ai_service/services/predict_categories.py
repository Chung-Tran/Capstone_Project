# services/product_recommender.py
from datetime import datetime, timedelta
from typing import Dict, List
from loguru import logger
import pandas as pd
import os
import asyncio
from utils.predict_categories import CategoriesRecommender

# Đường dẫn tới thư mục chứa mô hình
MODEL_DIR = os.getenv("MODEL_DIR", "./models/predict_event_categories")

# Singleton instance của CategoriesRecommender
recommender = None

async def get_recommender() -> CategoriesRecommender:
    """
    Trả về instance của CategoriesRecommender, khởi tạo nếu chưa tồn tại.
    Sử dụng singleton pattern để tránh tải lại mô hình mỗi lần gọi API.
    """
    global recommender
    if recommender is None:
        try:
            # Khởi tạo và load model
            recommender = CategoriesRecommender(model_dir=MODEL_DIR)
            logger.info(f"Loaded product recommender model from {MODEL_DIR}")
        except Exception as e:
            logger.error(f"Error loading product recommender model: {str(e)}")
            raise RuntimeError(f"Failed to load product recommender model: {str(e)}")
    return recommender

async def predict_hot_products(input_date: str, period: int = 90, top_n: int = 5) -> List[Dict]:
    """
    Dự đoán danh sách sản phẩm hot trong khoảng thời gian tới 
    dựa trên các sự kiện sắp diễn ra.
    
    Args:
        input_date: Ngày bắt đầu dự đoán, định dạng YYYY-MM-DD
        period: Số ngày dự đoán
        top_n: Số lượng sản phẩm hot nhất muốn trả về
        
    Returns:
        List của dict, mỗi dict chứa category, event và count
    """
    try:
        # Validate input
        try:
            pd.to_datetime(input_date)
        except ValueError:
            raise ValueError(f"Invalid date format: {input_date}. Please use YYYY-MM-DD format.")
        
        if period <= 0:
            raise ValueError(f"Period must be positive, got {period}")
        
        if top_n <= 0:
            raise ValueError(f"top_n must be positive, got {top_n}")
        
        # Get recommender
        recommender = await get_recommender()
        
        # Gọi model để dự đoán
        results = recommender.predict_hot_products(
            input_date_str=input_date,
            period=period,
            top_n=top_n
        )
        
        # Nếu không có kết quả, trả về danh sách trống
        if not results:
            logger.warning(f"No hot products predicted for period starting from {input_date}")
            return []
            
        return results
    
    except Exception as e:
        logger.error(f"Error predicting hot products: {str(e)}")
        raise