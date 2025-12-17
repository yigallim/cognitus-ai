from redis.asyncio import Redis
from motor.motor_asyncio import AsyncIOMotorClient
from .config import settings

redis_client = Redis(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    db=settings.REDIS_DB,
    decode_responses=True
)

mongodb_client = AsyncIOMotorClient(settings.MONGODB_URL)
db = mongodb_client[settings.MONGODB_DATABASE]

async def get_db():
    return db
