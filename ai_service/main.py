from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from controllers import logging_controller, recommendation_controller, review_controller, predict_controller

app = FastAPI()

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # hoặc chỉ định cụ thể: ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(logging_controller.router, prefix="/api")
app.include_router(recommendation_controller.router, prefix="/api")
app.include_router(review_controller.router, prefix="/api")
app.include_router(predict_controller.router, prefix="/api")
