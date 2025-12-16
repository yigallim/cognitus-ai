from typing import Optional, List
from .repository import EnvRepository
from .schemas import EnvSchema

class EnvService:
    def __init__(self):
        self.repo = EnvRepository()

    async def create_env(self, container_id: str, env_id: str) -> bool: 
        env = EnvSchema(env_id=env_id, variables={})
        return await self.repo.add_env(container_id, env.model_dump())

    async def list_envs(self, container_id: str) -> Optional[list[str]]:
        envs = await self.repo.list_envs(container_id)
        if envs is None:
            return None
        return list(envs.keys())

    async def delete_env(self, container_id: str, env_id: str) -> bool:
        return await self.repo.delete_env(container_id, env_id)

    async def get_env(self, container_id: str, env_id: str) -> Optional[dict]:
        return await self.repo.get_env(container_id, env_id)

    async def clear_env_state(self, container_id: str, env_id: str) -> bool:
        env_data = await self.repo.get_env(container_id, env_id)
        if not env_data:
            return False
            
        env_data["variables"] = {}
        return await self.repo.update_env(container_id, env_data)
