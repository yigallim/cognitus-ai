from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List
from .schemas import FileMetadata

class FileRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db["files"]

    async def save_file_metadata(self, metadata: FileMetadata):
        await self.collection.update_one(
            {"id": metadata.id, "user_id": metadata.user_id},
            {"$set": metadata.model_dump()},
            upsert=True
        )

    async def get_user_file_ids(self, user_id: str) -> List[str]:
        cursor = self.collection.find({"user_id": user_id}, {"id": 1})
        docs = await cursor.to_list(length=None)
        return [doc["id"] for doc in docs]

    async def is_file_owned_by_user(self, file_id: str, user_id: str) -> bool:
        doc = await self.collection.find_one({"id": file_id, "user_id": user_id})
        return doc is not None

    async def delete_file_metadata(self, file_id: str, user_id: str):
        await self.collection.delete_one({"id": file_id, "user_id": user_id})
