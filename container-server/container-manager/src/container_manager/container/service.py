from cuid2 import cuid_wrapper
import secrets
from typing import Dict, Optional
from docker.errors import NotFound
from fastapi.concurrency import run_in_threadpool
from container_manager.util import logger
from container_manager.connections import docker_client
from .repository import ContainerRepository
from .schemas import ContainerSchema, JupyterConnection

cuid = cuid_wrapper()

class ContainerService:
    def __init__(self):
        self.repo = ContainerRepository()

    async def create_container(self) -> str:
        container_id = cuid()
        token = secrets.token_urlsafe(32)

        try:
            def _start_container():
                docker_container = docker_client.containers.run(
                    image="container-node-app:latest",
                    name=f"{container_id}",
                    detach=True,
                    ports={"8888/tcp": 8888},
                    environment={
                        "ACCESS_TOKEN": token,
                    },
                    labels={
                        "created_by": "container_manager",
                        "container_id": container_id,
                    },
                )
                docker_container.reload()
                return docker_container

            docker_container = await run_in_threadpool(_start_container)
            port_info = docker_container.attrs["NetworkSettings"]["Ports"]["8888/tcp"][0]

            container_data = ContainerSchema(
                name=docker_container.name or "unknown",
                status="running",
                jupyter=JupyterConnection(
                    host=port_info["HostIp"],
                    port=port_info["HostPort"],
                    token=token,
                ),
            )

            await self.repo.save(container_id, container_data.model_dump())
            return container_id

        except Exception as e:
            logger.error(f"Error creating Jupyter container: {e}")
            raise

    async def get_container(self, container_id: str) -> Optional[dict]:
        return await self.repo.get(container_id)

    async def list_containers(self) -> Dict[str, dict]:
        return await self.repo.list_all()

    async def delete_container(self, container_id: str) -> bool:
        container = await self.repo.get(container_id)
        if not container:
            return False

        try:
            def _remove_container():
                try:
                    docker_container = docker_client.containers.get(container["name"])
                    docker_container.remove(force=True)
                except NotFound:
                    logger.warning(f"Docker container already removed: {container['name']}")

            await run_in_threadpool(_remove_container)
        except Exception as e:
            logger.error(f"Error removing container {container_id}: {e}")

        await self.repo.delete(container_id)
        return True
