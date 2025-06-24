import tensorflow as tf
import numpy as np
import pickle
import os
import re
import unicodedata
from tensorflow.keras.preprocessing.sequence import pad_sequences
from loguru import logger
from typing import Tuple, Dict, Any
import time
from datetime import datetime, timedelta
from typing import Dict, List

# Đường dẫn file
MODEL_PATH = "models/sentiment_models/CNN-LSTM-model.keras"
TOKENIZER_PATH = "models/sentiment_models/tokenizer.pickle"
LABEL_MAPPING_PATH = "models/sentiment_models/label_mapping.pickle"
METADATA_PATH = "models/sentiment_models/model_metadata.pickle"

# Biến toàn cục để lưu trữ model và metadata
_model = None
_tokenizer = None
_label_mapping = None
_metadata = None
_inverse_label_mapping = None
_sentiment_cache = {}

def _load_resources() -> bool:
    """Tải các tài nguyên cần thiết cho model (lazy loading)"""
    global _model, _tokenizer, _label_mapping, _metadata, _inverse_label_mapping
    
    try:
        # Tải model nếu chưa có
        if _model is None:
            logger.info(f"Loading sentiment analysis model from {MODEL_PATH}")
            _model = tf.keras.models.load_model(MODEL_PATH)
        
        # Tải tokenizer nếu chưa có
        if _tokenizer is None:
            logger.info(f"Loading tokenizer from {TOKENIZER_PATH}")
            with open(TOKENIZER_PATH, 'rb') as handle:
                _tokenizer = pickle.load(handle)
        
        # Tải ánh xạ nhãn nếu chưa có
        if _label_mapping is None:
            logger.info(f"Loading label mapping from {LABEL_MAPPING_PATH}")
            with open(LABEL_MAPPING_PATH, 'rb') as handle:
                _label_mapping = pickle.load(handle)
                _inverse_label_mapping = {v: k for k, v in _label_mapping.items()}
        
        # Tải metadata nếu chưa có
        if _metadata is None:
            logger.info(f"Loading model metadata from {METADATA_PATH}")
            with open(METADATA_PATH, 'rb') as handle:
                _metadata = pickle.load(handle)
                
        # logger.info(f"Sentiment analysis resources loaded successfully")
        # logger.debug(f"Model metadata: {_metadata}")
        # logger.debug(f"Label mapping: {_label_mapping}")
        
        return True
        
    except Exception as e:
        logger.error(f"Failed to load sentiment analysis resources: {str(e)}")
        return False

def clean_text(text: str) -> str:
    """
    Làm sạch văn bản tiếng Việt theo cách giống như trong quá trình huấn luyện
    
    Args:
        text: Văn bản đầu vào cần làm sạch
        
    Returns:
        Văn bản đã được làm sạch
    """
    if not isinstance(text, str):
        return ""
    
    # Chuyển thành chữ thường
    text = text.lower()
    
    # Loại bỏ URL
    text = re.sub(r'http\S+', '', text)
    
    # Thay thế dấu câu bằng khoảng trắng
    text = re.sub(r'[^\w\s]', ' ', text)
    
    # Chuẩn hóa khoảng trắng
    text = re.sub(r'\s+', ' ', text).strip()
    
    # Xử lý tiếng Việt với thư viện underthesea nếu có
    try:
        from underthesea import word_tokenize
        text = " ".join(word_tokenize(text))
    except ImportError:
        logger.warning("Thư viện underthesea không có sẵn, bỏ qua tokenization từ")
    
    return text

def remove_diacritics(text: str) -> str:
    """
    Loại bỏ dấu khỏi văn bản tiếng Việt
    
    Args:
        text: Văn bản đầu vào có dấu
        
    Returns:
        Văn bản không dấu
    """
    if not isinstance(text, str):
        return ""
    
    text = unicodedata.normalize('NFD', text)
    return ''.join(c for c in text if unicodedata.category(c) != 'Mn')

def analyze_sentiment(text: str) -> Tuple[str, float]:
    """
    Phân tích cảm xúc của văn bản đầu vào
    
    Args:
        text: Nội dung văn bản cần phân tích
        
    Returns:
        Tuple gồm (nhãn cảm xúc, độ tin cậy)
    """
    start_time = time.time()
    
    # Kiểm tra đầu vào
    if not text or not isinstance(text, str) or text.strip() == "":
        logger.warning("Empty or invalid input text for sentiment analysis")
        return "unknown", 0.0
    
    # Kiểm tra cache
    cache_key = text[:100]  # Sử dụng 100 ký tự đầu làm key
    if cache_key in _sentiment_cache:
        logger.debug(f"Using cached result for text: '{text[:30]}...'")
        return _sentiment_cache[cache_key]
        
    # Tải model và tài nguyên
    if not _load_resources():
        logger.error("Failed to load sentiment analysis resources")
        return "unknown", 0.0
    
    try:
        # Bước 1: Phân tích với văn bản gốc
        result_original = _analyze_text_variant(text, False)
        
        # Bước 2: Phân tích với văn bản không dấu
        result_no_diacritics = _analyze_text_variant(text, True)
        
        # Chọn kết quả có độ tin cậy cao hơn
        if result_no_diacritics[1] > result_original[1]:
            result = result_no_diacritics
            # logger.debug(f"Using no-diacritics version with higher confidence: {result[1]:.4f} > {result_original[1]:.4f}")
        else:
            result = result_original
        print(f"text:{text} Result: {result}")
        # Lưu kết quả vào cache
        _sentiment_cache[cache_key] = result
        
        # elapsed = time.time() - start_time
        # logger.debug(f"Sentiment analysis completed in {elapsed:.3f}s: {result[0]} ({result[1]:.4f})")
        
        return result
        
    except Exception as e:
        logger.error(f"Error in sentiment analysis: {str(e)}")
        return "unknown", 0.0

def _analyze_text_variant(text: str, remove_dia: bool = False) -> Tuple[str, float]:
    """
    Phân tích một biến thể của văn bản (có dấu hoặc không dấu)
    
    Args:
        text: Văn bản đầu vào
        remove_dia: Có loại bỏ dấu hay không
        
    Returns:
        Tuple gồm (nhãn cảm xúc, độ tin cậy)
    """
    # Đảm bảo model đã được tải
    if not _load_resources():
        return "unknown", 0.0
    
    # Làm sạch văn bản
    cleaned_text = clean_text(text)
    
    # Loại bỏ dấu nếu cần
    if remove_dia:
        cleaned_text = remove_diacritics(cleaned_text)
    
    # Tokenize và đệm chuỗi
    sequence = _tokenizer.texts_to_sequences([cleaned_text])
    padded = pad_sequences(sequence, maxlen=_metadata['maxlen'])
    
    # Dự đoán
    prediction = _model.predict(padded, verbose=0)[0]
    
    # Lấy chỉ số nhãn có xác suất cao nhất
    predicted_idx = np.argmax(prediction)
    
    # Lấy nhãn và độ tin cậy
    sentiment = _inverse_label_mapping.get(predicted_idx, "unknown")
    confidence = float(prediction[predicted_idx])
    
    logger.debug(f"Variant {'no-diacritics' if remove_dia else 'original'}: {sentiment} ({confidence:.4f})")
    
    return sentiment, confidence

def get_model_info() -> Dict[str, Any]:
    """
    Lấy thông tin về mô hình
    
    Returns:
        Dictionary chứa thông tin về mô hình
    """
    if not _load_resources():
        return {"status": "error", "message": "Failed to load model resources"}
    
    return {
        "status": "ok",
        "model_type": "CNN-LSTM hybrid",
        "version": _metadata.get('version', "unknown"),
        "training_dataset": _metadata.get('training_dataset', "unknown"),
        "vocab_size": _metadata.get('max_features', 0),
        "max_sequence_length": _metadata.get('maxlen', 0),
        "sentiment_classes": list(_label_mapping.keys()) if _label_mapping else [],
        "embedding_dims": _metadata.get('embedding_dims', 0)
    }

def clear_cache() -> None:
    """Xóa cache kết quả phân tích cảm xúc"""
    global _sentiment_cache
    cache_size = len(_sentiment_cache)
    _sentiment_cache = {}
    logger.info(f"Cleared sentiment analysis cache ({cache_size} entries)")


def filter_stores_with_negative_comments(analysis_result: List[Dict]) -> List[Dict]:
    """
    Lọc chỉ các store có comments tiêu cực
    
    Args:
        analysis_result: Kết quả từ analyze_stores_sentiment
        
    Returns:
        Danh sách chỉ các store có comments tiêu cực
    """
    return [store for store in analysis_result if store.get("negative_comments")]

# Utility function để thống kê tổng quan
def get_sentiment_summary(analysis_result: List[Dict]) -> Dict:
    """
    Tạo báo cáo tổng quan về sentiment analysis
    
    Args:
        analysis_result: Kết quả từ analyze_stores_sentiment
        
    Returns:
        Dictionary chứa thông tin tổng quan
    """
    total_stores = len(analysis_result)
    stores_with_negative = len([store for store in analysis_result if store.get("negative_comments")])
    total_negative_comments = sum(len(store.get("negative_comments", [])) for store in analysis_result)
    
    return {
        "total_stores_analyzed": total_stores,
        "stores_with_negative_comments": stores_with_negative,
        "total_negative_comments": total_negative_comments,
        "analysis_timestamp": datetime.now().isoformat()
    }