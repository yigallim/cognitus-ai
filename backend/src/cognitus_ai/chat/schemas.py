from pydantic import BaseModel, Field, GetJsonSchemaHandler
from pydantic.json_schema import JsonSchemaValue
from pydantic_core import core_schema
from typing import List, Literal, Optional, Any
from datetime import datetime
from bson.objectid import ObjectId

class PyObjectId(str):
    @classmethod
    def __get_pydantic_core_schema__(
        cls, _source_type: Any, _handler: Any
    ) -> core_schema.CoreSchema:
        return core_schema.json_or_python_schema(
            json_schema=core_schema.str_schema(),
            python_schema=core_schema.union_schema([
                core_schema.is_instance_schema(ObjectId),
                core_schema.chain_schema([
                    core_schema.str_schema(),
                    core_schema.no_info_plain_validator_function(cls.validate),
                ]),
            ]),
            serialization=core_schema.plain_serializer_function_ser_schema(
                lambda v: str(v)
            ),
        )

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(
        cls, _core_schema: core_schema.CoreSchema, handler: GetJsonSchemaHandler
    ) -> JsonSchemaValue:
        return handler(core_schema.str_schema())



class BaseChatMessage(BaseModel):
    id: str = ""
    content: str
    name: Optional[str] = None

class SystemMessage(BaseChatMessage):
    role: Literal["system"] = "system"

class UserMessage(BaseChatMessage):
    role: Literal["user"] = "user"
    type: Literal["instruction", "tool_result"] = "instruction"

class AssistantMessage(BaseChatMessage):
    role: Literal["assistant"] = "assistant"
    type: Literal["tool_call", "final_answer"] = "tool_call"

class ChatBase(BaseModel):
    title: str

class ChatCreate(ChatBase):
    pass

class ChatUpdate(BaseModel):
    title: Optional[str] = None

class ChatCaptureRequest(BaseModel):
    content: str

class Chat(ChatBase):
    id: PyObjectId = Field(default_factory=PyObjectId)
    user_id: str
    history: List[dict[str, Any]] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}
        arbitrary_types_allowed = True
