from fastapi import APIRouter, HTTPException
from schemas.user_action import UserAction
from database.mongo import user_action_collection
from bson import ObjectId
from datetime import datetime

router = APIRouter()

@router.post("/log-action")
async def log_action(action: UserAction):
    try:
        data = action.dict()

        # Ensure customer_id is an ObjectId
        data["customer_id"] = ObjectId(data["customer_id"])

        # Nếu không có timestamp thì dùng thời gian hiện tại
        if "timestamp" not in data or data["timestamp"] is None:
            data["timestamp"] = datetime.utcnow()
        elif isinstance(data["timestamp"], int):  # Nếu là epoch int
            data["timestamp"] = datetime.utcfromtimestamp(data["timestamp"])

        await user_action_collection.insert_one(data)
        return {"status": "logged"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
