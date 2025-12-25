from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId 
from datetime import datetime
from typing import List, Optional, Any, Dict
from cognitus_ai.database import db
from cognitus_ai.utils.nanoid import generate_id
from .schemas import Chat, ChatCreate, ChatUpdate

class ChatRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db["chats"]

    async def create(self, user_id: str, instruction: str, chat: ChatCreate) -> Chat:
        chat_dict = chat.model_dump()
        chat_dict["user_id"] = user_id

        # Seed mock chat history on creation
        # assistant_content = (
        #     "This is example codes.\n\n\n"
        #     "```python\n"
        #     "# Load labelled.csv and do an initial inspection\n"
        #     "import pandas as pd\n"
        #     "from tqdm import tqdm\n\n"
        #     "labelled_df = pd.read_csv('labelled.csv', encoding='ascii')\n"
        #     "print(labelled_df.head())\n"
        #     "print(labelled_df.describe(include='all'))\n"
        #     "```\n\n"
        #     "Simple Table:\n"
        #     "| Header 1 | Header 2 | Header 3 | Header 3 |\n"
        #     "|---|---|---|---|\n"
        #     "| Row 1, Col 1 | Row 1, Col 2 | Row 1, Col 3 | Row 1, Col 4 |\n"
        #     "| Row 2, Col 1 | Row 2, Col 2 | Row 2, Col 3 | Row 2, Col 4 |\n"
        #     "\n\nAnd here is an image:\n\n\n"
        #     "![Image](https://i.postimg.cc/Mp3ZXpdm/image.png)"
        # )

        seed_history= [{"id": generate_id(), "role": "user", "content": "[USER INSTRUCTION]: " + instruction, "type": "instruction"}]
        chat_dict["history"] = seed_history
        chat_dict["created_at"] = datetime.utcnow()
        chat_dict["updated_at"] = datetime.utcnow()
        chat_dict["file_map"] = {}
        result = await self.collection.insert_one(chat_dict)
        chat_dict["id"] = chat_dict.pop("_id")
        return Chat(**chat_dict)

    async def get_by_id(self, chat_id: str, user_id: str) -> Optional[Chat]:
        if not ObjectId.is_valid(chat_id):
            return None
            
        chat_dict = await self.collection.find_one({
            "_id": ObjectId(chat_id),
            "user_id": user_id
        })
        
        if chat_dict:
            chat_dict["id"] = chat_dict.pop("_id")
            return Chat(**chat_dict)
        return None

    async def list_by_user(self, user_id: str) -> List[Chat]:
        cursor = self.collection.find({"user_id": user_id}).sort("updated_at", -1)
        chats_dicts = await cursor.to_list(length=100)
        for chat in chats_dicts:
            chat["id"] = chat.pop("_id")
        return [Chat(**chat) for chat in chats_dicts]

    async def update(self, chat_id: str, user_id: str, chat_update: ChatUpdate) -> Optional[Chat]:
        if not ObjectId.is_valid(chat_id):
            return None
            
        update_data = chat_update.model_dump(exclude_unset=True)
        update_data["updated_at"] = datetime.utcnow()
        
        chat_dict = await self.collection.find_one_and_update(
            {"_id": ObjectId(chat_id), "user_id": user_id},
            {"$set": update_data},
            return_document=True
        )
        
        if chat_dict:
            chat_dict["id"] = chat_dict.pop("_id")
            return Chat(**chat_dict)
        return None

    async def add_message(self, chat_id: str, user_id: str, message: Dict[str, Any]) -> Optional[Chat]:
        if not ObjectId.is_valid(chat_id):
            return None
            
        chat_dict = await self.collection.find_one_and_update(
            {"_id": ObjectId(chat_id), "user_id": user_id},
            {
                "$push": {"history": message},
                "$set": {"updated_at": datetime.utcnow()}
            },
            return_document=True
        )
        
        if chat_dict:
            chat_dict["id"] = chat_dict.pop("_id")
            return Chat(**chat_dict)
        return None

    async def delete(self, chat_id: str, user_id: str) -> bool:
        if not ObjectId.is_valid(chat_id):
            return False
            
        result = await self.collection.delete_one({
            "_id": ObjectId(chat_id),
            "user_id": user_id
        })
        return result.deleted_count > 0
    
    async def get_file_map(self, chat_id: str, user_id: str) -> Optional[Dict[str, str]]:
        if not ObjectId.is_valid(chat_id):
            return None
            
        chat_dict = await self.collection.find_one(
            {"_id": ObjectId(chat_id), "user_id": user_id},
            {"file_map": 1}  # Projection to only get file_map
        )
        
        if chat_dict:
            return chat_dict.get("file_map", {})
        return None

chat_repository = ChatRepository(db)
