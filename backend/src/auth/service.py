from .schemas import UserInDB, Role
from uuid6 import uuid7
from .utils import get_password_hash, verify_password

# Mock Redis-like interface for abstraction
class TokenStore:
    def __init__(self):
        # In-memory store: {refresh_token: user_email}
        # In Redis, this could be: SET refresh_token user_email EX <expiry>
        self._store: dict[str, str] = {}

    def set_token(self, token: str, value: str, ttl_seconds: int | None = None):
        self._store[token] = value
        # Note: In-memory python dict doesn't handle TTL automatically. 
        # For a real implementation, we would need a cleanup job or check expiry on access.
        # But since JWT has expiry claim, we can also rely on that for validity,
        # and use this store mainly for revocation (allowed list).
        
    def get_token(self, token: str) -> str | None:
        return self._store.get(token)

    def delete_token(self, token: str):
        if token in self._store:
            del self._store[token]

    def exists(self, token: str) -> bool:
        return token in self._store

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

    def authenticate_user(self, email: str, password: str) -> UserInDB | None:
        user = self.get_user_by_email(email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user

    def get_user_by_email(self, email: str) -> UserInDB | None:
        return self.db.get(email)

    def store_refresh_token(self, token: str, email: str):
        # Store for revocation check.
        # In production with Redis, you set this with TTL matching the token's lifetime.
        self.token_store.set_token(token, email)

    def revoke_refresh_token(self, token: str):
        self.token_store.delete_token(token)

    def is_refresh_token_valid(self, token: str) -> bool:
        # Check if token exists in our "allow-list" / store
        # If we were using a block-list approach, we would check if it's NOT in the list.
        # For stateful tokens (like sessions), presence in store is required.
        return self.token_store.exists(token)

auth_service = AuthService()
