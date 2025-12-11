from redis.asyncio.client import Redis
from datetime import timedelta
from .schemas import UserInDB, Role
from uuid6 import uuid7
from .utils import get_password_hash, verify_password
from src.database import redis_client
from src.config import settings

class TokenStore:
    def __init__(self):
        self.client: Redis = redis_client

    async def set_token(self, token: str, value: str, ttl: timedelta):
        await self.client.set(token, value, ex=ttl)

    async def get_token(self, token: str) -> str | None:
        return await self.client.get(token)

    async def delete_token(self, token: str):
        await self.client.delete(token)

    async def exists(self, token: str) -> bool:
        return await self.client.exists(token) > 0

# Initialize global instances
token_store = TokenStore()

# Mock User Database
# Using a fixed email/password for the "hard coded user" requirement.
MOCK_USER_EMAIL = "user@example.com"
MOCK_USER_PASSWORD = "password123"
MOCK_USER_DB: dict[str, UserInDB] = {
    MOCK_USER_EMAIL: UserInDB(
        id=uuid7(),
        username="testuser",
        email=MOCK_USER_EMAIL,
        role=Role.user,
        hashed_password=get_password_hash(MOCK_USER_PASSWORD),
        is_active=True
    )
}

class AuthService:
    def __init__(self):
        self.db: dict[str, UserInDB] = MOCK_USER_DB
        self.token_store: TokenStore = token_store

    async def authenticate_user(self, email: str, password: str) -> UserInDB | None:
        # Simulate async db call
        user = self.get_user_by_email(email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user

    def get_user_by_email(self, email: str) -> UserInDB | None:
        return self.db.get(email)

    async def store_refresh_token(self, token: str, email: str):
        ttl = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        await self.token_store.set_token(token, email, ttl)

    async def revoke_refresh_token(self, token: str):
        await self.token_store.delete_token(token)

    async def is_refresh_token_valid(self, token: str) -> bool:
        return await self.token_store.exists(token)

auth_service = AuthService()
