from fastapi import APIRouter, HTTPException
from .schemas import CreateEnvRequest, ExecuteCellRequest
from .service import EnvService
from container_manager.util import logger

router = APIRouter()
service = EnvService()

@router.post("/containers/{container_id}/envs")
async def create_env(container_id: str, body: CreateEnvRequest):
    logger.info(f"Creating env {body.env_id} for container {container_id}")
    success = await service.create_env(container_id, body.env_id)
    if not success:
        logger.warning(f"Failed to create env. Container not found: {container_id}")
        raise HTTPException(404, "Container not found")

    logger.info(f"Environment {body.env_id} created successfully")
    return {"env_id": body.env_id, "status": "created"}


@router.get("/containers/{container_id}/envs")
async def list_envs(container_id: str):
    envs = await service.list_envs(container_id)
    if envs is None:
        raise HTTPException(404, "Container not found")

    return {"envs": envs}


@router.delete("/containers/{container_id}/envs/{env_id}")
async def delete_env(container_id: str, env_id: str):
    logger.info(f"Deleting env {env_id} from container {container_id}")
    success = await service.delete_env(container_id, env_id)
    if not success:
        logger.warning(f"Delete env failed. Environment not found: {env_id}")
        raise HTTPException(404, "Environment not found")

    return {"status": "deleted"}


@router.post("/containers/{container_id}/envs/{env_id}/execute")
async def execute_cell(container_id: str, env_id: str, body: ExecuteCellRequest):
    logger.info(f"Executing code in env {env_id} (container {container_id})")
    if not await service.get_env(container_id, env_id):
        logger.warning(f"Execution failed. Environment not found: {env_id}")
        raise HTTPException(404, "Environment not found")

    # Fake execution
    return {
        "env_id": env_id,
        "result": f"Executed code: {body.code!r}",
        "stdout": "",
        "stderr": "",
    }


@router.post("/containers/{container_id}/envs/{env_id}/restart")
async def restart_env(container_id: str, env_id: str):
    logger.info(f"Restarting env {env_id} in container {container_id}")
    success = await service.clear_env_state(container_id, env_id)
    if not success:
        logger.warning(f"Restart failed. Environment not found: {env_id}")
        raise HTTPException(404, "Environment not found")
    return {"env_id": env_id, "status": "restarted"}


@router.post("/containers/{container_id}/envs/{env_id}/interrupt")
async def interrupt_env(container_id: str, env_id: str):
    logger.info(f"Interrupting env {env_id} in container {container_id}")
    if not await service.get_env(container_id, env_id):
        logger.warning(f"Interrupt failed. Environment not found: {env_id}")
        raise HTTPException(404, "Environment not found")

    return {"env_id": env_id, "status": "interrupted"}
