import uuid6
from typing import Dict, Optional
from .connections import docker_client
from .util import logger

class ContainerService:
    def __init__(self):
        self.containers: Dict[str, dict] = {}
        self.python_envs: Dict[str, dict] = {}

    def create_container(self) -> str:
        container_id = str(uuid6.uuid7())
        
        try:
            docker_container = docker_client.containers.run(
                "container-node-base:latest",
                detach=True,
                name=container_id,
                labels={"created_by": "container_manager"}
            )
            
            self.containers[container_id] = {
                "config": None,
                "envs": {},
                "docker_id": docker_container.id,
                "status": "running"
            }
            logger.info(f"Container created successfully: {container_id}")
            return container_id
        except Exception as e:
            logger.error(f"Error creating container: {e}")
            raise e

    def get_container(self, container_id: str) -> Optional[dict]:
        return self.containers.get(container_id)

    def delete_container(self, container_id: str) -> bool:
        if container_id not in self.containers:
            return False
            
        container = self.containers[container_id]
        try:
            if "docker_id" in container:
                d_container = docker_client.containers.get(container["docker_id"])
                d_container.remove(force=True)
                logger.info(f"Docker container {container['docker_id']} removed")
        except Exception as e:
            logger.error(f"Error removing docker container for {container_id}: {e}")
            
        del self.containers[container_id]
        return True

    def create_env(self, container_id: str, env_id: str) -> bool:
        container = self.get_container(container_id)
        if not container:
            return False
        
        env = {
            "env_id": env_id,
            "variables": {},
        }
        container["envs"][env_id] = env
        self.python_envs[env_id] = env
        return True

    def list_envs(self, container_id: str) -> Optional[list[str]]:
        container = self.get_container(container_id)
        if not container:
            return None
        return list(container["envs"].keys())

    def delete_env(self, container_id: str, env_id: str) -> bool:
        container = self.get_container(container_id)
        if not container or env_id not in container["envs"]:
            return False
        
        del container["envs"][env_id]
        if env_id in self.python_envs:
            del self.python_envs[env_id]
        return True

    def get_env(self, env_id: str) -> Optional[dict]:
        return self.python_envs.get(env_id)

    def clear_env_state(self, env_id: str) -> bool:
        if env_id in self.python_envs:
            self.python_envs[env_id]["variables"] = {}
            return True
        return False
