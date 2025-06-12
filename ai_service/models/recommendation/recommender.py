import joblib
import os
from database.mongo import user_action_collection, product_collection

MODEL_PATH = "models/recommendation/model.pkl"

def load_model():
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError("Model not found. Train first.")
    return joblib.load(MODEL_PATH)


async def get_all_product_ids():
    cursor = product_collection.find({}, {"_id": 1})
    docs = await cursor.to_list(length=None)
    return [str(p["_id"]) for p in docs]


async def get_user_seen_product_ids(customer_id: str):
    cursor = user_action_collection.find({"customer_id": customer_id}, {"product_id": 1})
    docs = await cursor.to_list(length=None)
    return set(str(doc["product_id"]) for doc in docs)


async def recommend_product_ids(customer_id: str, top_n: int = 10) -> list:
    model =  load_model()
    all_products = await get_all_product_ids()
    seen_products = await get_user_seen_product_ids(customer_id)

    candidates = [pid for pid in all_products if pid not in seen_products]

    predictions = [
        (pid, model.predict(customer_id, pid).est) for pid in candidates
    ]
    sorted_preds = sorted(predictions, key=lambda x: x[1], reverse=True)[:top_n]
    return [pid for pid, _ in sorted_preds]

async def recommend_keywords(customer_id: str, top_n: int = 10) -> list[str]:
    model = load_model()

    # Lấy toàn bộ sản phẩm kèm theo keyword
    cursor = product_collection.find({}, {"_id": 1, "keywords": 1})
    products = await cursor.to_list(length=None)
    all_products = [
        {"product_id": str(p["_id"]), "keywords": p.get("keywords", [])}
        for p in products
    ]

    # Lấy sản phẩm đã xem
    seen_cursor = user_action_collection.find({"customer_id": customer_id}, {"product_id": 1})
    seen_docs = await seen_cursor.to_list(length=None)
    seen_products = {str(doc["product_id"]) for doc in seen_docs}

    # Lọc ra sản phẩm chưa xem
    unseen_products = [p for p in all_products if p["product_id"] not in seen_products]

    # Dự đoán điểm
    predictions = [
        (p["keywords"], model.predict(customer_id, p["product_id"]).est)
        for p in unseen_products if p["keywords"]
    ]

    # Sắp xếp theo điểm
    sorted_keywords = sorted(predictions, key=lambda x: x[1], reverse=True)

    # Gộp tất cả keyword lại và đếm tần suất (tránh trùng)
    from collections import Counter
    flat_keywords = [kw for kws, _ in sorted_keywords for kw in kws]
    keyword_counts = Counter(flat_keywords)

    # Trả về các keyword phổ biến nhất
    recommended_keywords = [kw for kw, _ in keyword_counts.most_common(top_n)]

    return recommended_keywords
