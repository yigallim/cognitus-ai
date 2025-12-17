from pydantic import BaseModel, EmailStr, Field
from enum import Enum
from uuid import UUID
from uuid6 import uuid7

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
    id: UUID = Field(default_factory=uuid7)
    is_active: bool = True
    container_id: str | None = None
    container_name: str | None = None
    container_ip: str | None = None

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "id": "0193b2a2-3b2e-7111-b3b3-3b3b3b3b3b3b",
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


