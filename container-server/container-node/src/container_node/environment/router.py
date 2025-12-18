import shutil
from pathlib import Path
from fastapi import APIRouter, HTTPException
from container_node.config import get_settings

router = APIRouter(prefix="/envs", tags=["envs"])

def get_env_path(env_id: str) -> Path:
    settings = get_settings()
    return Path(settings.home_path) / env_id

@router.post("/{env_id}")
def create_environment(env_id: str):
    env_path = get_env_path(env_id)

    if env_path.exists():
        raise HTTPException(
            status_code=409,
            detail="Environment already exists"
        )

    env_path.mkdir(parents=True)

    return {
        "env_id": env_id,
        "path": str(env_path),
        "status": "created"
    }

@router.delete("/{env_id}")
def delete_environment(env_id: str):
    env_path = get_env_path(env_id)

    if not env_path.exists():
        raise HTTPException(
            status_code=404,
            detail="Environment not found"
        )

    shutil.rmtree(env_path)

    return {
        "env_id": env_id,
        "status": "deleted"
    }
