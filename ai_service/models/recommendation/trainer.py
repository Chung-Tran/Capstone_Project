import os
import pandas as pd
from surprise import Dataset, Reader, SVD
import joblib
from database.mongo import user_action_collection

MODEL_PATH = "models/recommendation/model.pkl"
RATING_SCALE = (1, 10)
ACTION_SCORE = {"click": 1, "cart": 2, "purchase": 3, "search": 3}


async def get_user_behavior():
    cursor = user_action_collection.find({
        "action_type": {"$in": list(ACTION_SCORE.keys())}
    }, {
        "customer_id": 1,
        "product_id": 1,
        "action_type": 1
    })
    return await cursor.to_list(length=None)


def transform_data(raw_data: list) -> pd.DataFrame:
    if not raw_data:
        raise ValueError("No user behavior data found for training.")

    df = pd.DataFrame(raw_data)
    df["customer_id"] = df["customer_id"].astype(str)
    df["product_id"] = df["product_id"].astype(str)
    df["score"] = df["action_type"].map(ACTION_SCORE)

    agg = df.groupby(['customer_id', 'product_id'])['score'].sum().reset_index()
    return agg


async def train_model():
    raw_data = await get_user_behavior()
    if not raw_data:
        return "⚠️ No user behavior data found. Cannot train model."

    agg_df = transform_data(raw_data)

    reader = Reader(rating_scale=RATING_SCALE)
    data = Dataset.load_from_df(agg_df[['customer_id', 'product_id', 'score']], reader)
    trainset = data.build_full_trainset()

    model = SVD()
    model.fit(trainset)

    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump(model, MODEL_PATH)

    return f"✅ Model trained on {len(agg_df)} user-product interactions"
