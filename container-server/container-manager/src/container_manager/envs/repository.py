import json
from typing import Optional, Dict
from redis.asyncio import Redis
from container_manager.connections import redis_client

class EnvRepository:
    def __init__(self):
        self.redis: Redis = redis_client
        self.CONTAINER_SET_KEY = "containers"

    def _get_key(self, container_id: str) -> str:
        return f"container:{container_id}"

    async def get_container_data(self, container_id: str) -> Optional[dict]:
        key = self._get_key(container_id)
        data = await self.redis.get(key)
        if data:
            return json.loads(data)
        return None

    async def save_container_data(self, container_id: str, data: dict) -> None:
        key = self._get_key(container_id)
        await self.redis.set(key, json.dumps(data))
        # No need to add to set here, as we assume container exists if we are adding envs? 
        # But for safety, we can leave it or ignore it. 
        # The main container logic manages the set.
        
    async def add_env(self, container_id: str, env_data: dict) -> bool:
        container = await self.get_container_data(container_id)
        if not container:
            return False
            
        container["envs"][env_data["env_id"]] = env_data
        await self.save_container_data(container_id, container)
        return True

    async def delete_env(self, container_id: str, env_id: str) -> bool:
        container = await self.get_container_data(container_id)
        if not container:
            return False
        
        if env_id in container["envs"]:
            del container["envs"][env_id]
            await self.save_container_data(container_id, container)
            return True
        return False

    async def get_env(self, container_id: str, env_id: str) -> Optional[dict]:
        container = await self.get_container_data(container_id)
        if not container:
            return None
        return container["envs"].get(env_id)

    async def update_env(self, container_id: str, env_data: dict) -> bool:
        container = await self.get_container_data(container_id)
        if not container:
            return False
        
        env_id = env_data["env_id"]
        # Only update if it exists or create? 'create_env' uses add_env.
        # This is for updates if needed.
        container["envs"][env_id] = env_data
        await self.save_container_data(container_id, container)
        return True
    
    async def list_envs(self, container_id: str) -> Optional[Dict[str, dict]]:
         container = await self.get_container_data(container_id)
         if not container:
             return None
         return container["envs"]
