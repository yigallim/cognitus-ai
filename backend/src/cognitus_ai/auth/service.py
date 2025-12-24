from datetime import timedelta
import docker
from .schemas import UserInDB, Role, UserCreate
from .utils import get_password_hash, verify_password
from .repository import TokenRepository, UserRepository
from cognitus_ai.config import config
from cognitus_ai.database import db
from cognitus_ai.utils.logging import logger

class AuthService:
    def __init__(self):
        self.user_repository = UserRepository(db)
        self.token_repository = TokenRepository()
        try:
            self.docker_client = docker.from_env()
        except Exception as e:
            logger.warning(f"Could not initialize Docker client: {e}")
            self.docker_client = None

    async def authenticate_user(self, email: str, password: str) -> UserInDB | None:
        user = await self.user_repository.get_by_email(email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user

    async def get_user_by_email(self, email: str) -> UserInDB | None:
        return await self.user_repository.get_by_email(email)

    async def signup(self, user_create: UserCreate) -> UserInDB:
        existing_user = await self.user_repository.get_by_email(user_create.email)
        if existing_user:
            raise ValueError("User with this email already exists")
        container_info = {}
        
        # if self.docker_client:
        #     container_name = f"user-{user_id}"
        #     try:
        #         container = self.docker_client.containers.run(
        #             image=settings.CONTAINER_IMAGE_NAME,
        #             name=container_name,
        #             network=settings.CONTAINER_NETWORK,
        #             detach=True,
        #             tty=True,
        #             command="tail -f /dev/null"
        #         )
                
        #         container.reload()
        #         network_settings = container.attrs['NetworkSettings']['Networks'].get(settings.CONTAINER_NETWORK)
        #         ip_address = network_settings['IPAddress'] if network_settings else None
                
        #         container_info = {
        #             "container_id": container.id,
        #             "container_name": container_name,
        #             "container_ip": ip_address
        #         }
        #         logger.info(f"Successfully created Docker container '{container_name}' (IP: {ip_address}) for user {user_create.email}")
        #     except Exception as e:
        #         logger.error(f"Failed to create Docker container for user {user_create.email}: {e}")

        hashed_password = get_password_hash(user_create.password)
        user_in_db = UserInDB(
            **user_create.model_dump(exclude={"password"}),
            hashed_password=hashed_password,
            is_active=True,
            **container_info
        )
        return await self.user_repository.create(user_in_db)

    async def store_refresh_token(self, token: str, email: str):
        ttl = timedelta(days=config.auth.refresh_token_expire_days)
        await self.token_repository.set_token(token, email, ttl)

    async def revoke_refresh_token(self, token: str):
        await self.token_repository.delete_token(token)

    async def is_refresh_token_valid(self, token: str) -> bool:
        return await self.token_repository.exists(token)

auth_service = AuthService()
