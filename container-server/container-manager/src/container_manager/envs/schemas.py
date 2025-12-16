from typing import Dict
from pydantic import BaseModel

class CreateEnvRequest(BaseModel):
    env_id: str

class ExecuteCellRequest(BaseModel):
    code: str
    timeout: int | None = None

class EnvSchema(BaseModel):
    env_id: str
    variables: Dict[str, str] = {}
