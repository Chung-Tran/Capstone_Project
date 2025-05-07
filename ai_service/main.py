from fastapi import FastAPI, HTTPException
from datetime import datetime
from controllers import logging_controller, recommendation_controller , review_controller

app = FastAPI()

app.include_router(logging_controller.router, prefix="/api")
app.include_router(recommendation_controller.router, prefix="/api")
app.include_router(review_controller.router, prefix="/api")
