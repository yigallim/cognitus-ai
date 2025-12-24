from pydantic import BaseModel, EmailStr, Field, GetJsonSchemaHandler
from pydantic.json_schema import JsonSchemaValue
from pydantic_core import core_schema
from typing import Any
from enum import Enum
from bson.objectid import ObjectId

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: str | None = None

class Role(str, Enum):
    user = "user"
    admin = "admin"

class UserBase(BaseModel):
    username: str
    email: EmailStr
    role: Role = Role.user

class User(UserBase):
    # Use MongoDB ObjectId for user IDs, consistent with chat schemas
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

    id: PyObjectId = Field(default_factory=PyObjectId)
    is_active: bool = True
    container_id: str | None = None
    container_name: str | None = None
    container_ip: str | None = None

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "id": "64b2f1c9d5e3f9a1b2c3d4e5",
                    "username": "johndoe",
                    "email": "user@example.com",
                    "role": "user",
                    "is_active": True
                }
            ]
        }
    }

class LoginResponse(Token):
    user: User

class UserInDB(User):
    hashed_password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "email": "user@example.com",
                    "password": "password123"
                }
            ]
        }
    }

class UserCreate(UserBase):
    password: str

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "username": "johndoe",
                    "email": "user@example.com",
                    "password": "password123"
                }
            ]
        }
    }


