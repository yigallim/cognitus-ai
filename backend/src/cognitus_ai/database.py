from redis.asyncio import Redis
from motor.motor_asyncio import AsyncIOMotorClient
from .config import config

redis_client = Redis(
    host=config.redis.host,
    port=config.redis.port,
    db=config.redis.db,
    decode_responses=True
)

mongodb_client = AsyncIOMotorClient(config.mongo.url)
db = mongodb_client[config.mongo.database]

async def get_db():
    return db
