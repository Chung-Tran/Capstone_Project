from fastapi import APIRouter, HTTPException
from schemas.user_action import UserAction
from database.mongo import user_action_collection
from datetime import datetime

router = APIRouter()

@router.post("/log-action")
async def log_action(action: UserAction):
    data = action.dict()
    data["timestamp"] = data.get("timestamp") or int(datetime.utcnow().timestamp())
    await user_action_collection.insert_one(data)
    return {"status": "logged"}
