import nanoid
import secrets
from typing import Dict, Optional
from docker.errors import NotFound
from fastapi.concurrency import run_in_threadpool
from container_manager.util import logger
from container_manager.connections import docker_client
from .repository import ContainerRepository
from .schemas import ContainerSchema, JupyterConnection

class ContainerService:
    def __init__(self):
        self.repo = ContainerRepository()

    async def create_container(self) -> str:
        container_id = nanoid.generate()
        token = secrets.token_urlsafe(32)

        try:
            def _start_container():
                # We need to access docker_client.containers which is what docker_client probably is or has
                # Original code: docker_client.containers.run
                docker_container = docker_client.containers.run(
                    image="jupyter/scipy-notebook:x86_64-python-3.11.6",
                    name=f"jupyter-{container_id}",
                    detach=True,
                    ports={"8888/tcp": 8888},
                    environment={
                        "JUPYTER_TOKEN": token,
                        "JUPYTER_ENABLE_LAB": "yes",
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
                    url=f"http://localhost:{port_info['HostPort']}/?token={token}",
                ),
                envs={},
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
