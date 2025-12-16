import json
from typing import Optional, Dict
from redis.asyncio import Redis
from container_manager.connections import redis_client

class ContainerRepository:
    def __init__(self):
        self.redis: Redis = redis_client
        self.CONTAINER_SET_KEY = "containers"

    def _get_key(self, container_id: str) -> str:
        return f"container:{container_id}"

    async def save(self, container_id: str, data: dict) -> None:
        key = self._get_key(container_id)
        await self.redis.set(key, json.dumps(data))
        await self.redis.sadd(self.CONTAINER_SET_KEY, container_id) # pyright: ignore[reportGeneralTypeIssues]

    async def get(self, container_id: str) -> Optional[dict]:
        key = self._get_key(container_id)
        data = await self.redis.get(key)
        if data:
            return json.loads(data)
        return None

    async def list_all(self) -> Dict[str, dict]:
        container_ids = await self.redis.smembers(self.CONTAINER_SET_KEY) # pyright: ignore[reportGeneralTypeIssues]
        result = {}
        for cid in container_ids:
            container = await self.get(cid)
            if container:
                result[cid] = container
        return result

    async def delete(self, container_id: str) -> None:
        key = self._get_key(container_id)
        await self.redis.delete(key)
        await self.redis.srem(self.CONTAINER_SET_KEY, container_id) # pyright: ignore[reportGeneralTypeIssues]
