from redis.asyncio.client import Redis
from datetime import timedelta
from cognitus_ai.database import redis_client

class TokenRepository:
    def __init__(self, prefix: str = "refresh_token:"):
        self.client: Redis = redis_client
        self.prefix = prefix

    def _get_key(self, token: str) -> str:
        return f"{self.prefix}{token}"

    async def set_token(self, token: str, value: str, ttl: timedelta):
        await self.client.set(self._get_key(token), value, ex=ttl)

    async def get_token(self, token: str) -> str | None:
        return await self.client.get(self._get_key(token))

    async def delete_token(self, token: str):
        await self.client.delete(self._get_key(token))

    async def exists(self, token: str) -> bool:
        return await self.client.exists(self._get_key(token)) > 0

from motor.motor_asyncio import AsyncIOMotorDatabase
from .schemas import UserInDB

class UserRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db["users"]

    async def get_by_email(self, email: str) -> UserInDB | None:
        user_dict = await self.collection.find_one({"email": email})
        if user_dict:
            # MongoDB uses _id, but our schema uses id (UUID)
            # We store it as string in Mongo or map it
            # For simplicity let's ensure we map back to the schema
            user_dict["id"] = user_dict.get("id") or user_dict.get("_id")
            return UserInDB(**user_dict)
        return None

    async def create(self, user: UserInDB) -> UserInDB:
        user_dict = user.model_dump()
        # Ensure ID is string for Mongo storage if needed, or keep as UUID
        # Pydantic will handle UUID to str conversion in model_dump if configured, 
        # but let's be explicit if we want.
        user_dict["id"] = str(user.id)
        await self.collection.insert_one(user_dict)
        return user
