# from motor.motor_asyncio import AsyncIOMotorClient

# client = AsyncIOMotorClient("")
# db = client["capstone-project-database"]
# user_action_collection = db.useractions

from motor.motor_asyncio import AsyncIOMotorClient

client = AsyncIOMotorClient("mongodb+srv://userDev:user%40123@cluster0.p7uza.mongodb.net/capstone-project-database?retryWrites=true&w=majority&appName=capstone-project-database")
db = client["capstone-project-database"]
user_action_collection = db["useractions"]
product_collection = db["products"]
review_collection = db["reviews"]
