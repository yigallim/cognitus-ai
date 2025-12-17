from typing import Dict
from pydantic import BaseModel
from container_manager.envs.schemas import EnvSchema

class JupyterConnection(BaseModel):
    host: str
    port: str
    token: str

class ContainerSchema(BaseModel):
    name: str
    status: str
    jupyter: JupyterConnection
    envs: Dict[str, EnvSchema] = {}
