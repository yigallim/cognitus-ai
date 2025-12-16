from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from .service import ContainerService
from .util import logger

app = FastAPI(title="Container Notebook API")
service = ContainerService()


class CreateEnvRequest(BaseModel):
    env_id: str

class ExecuteCellRequest(BaseModel):
    code: str
    timeout: int | None = None

@app.post("/containers")
async def create_container():
    logger.info("Request received to create a new container")
    container_id = service.create_container()
    logger.info(f"Container created with ID: {container_id}")
    return {"container_id": container_id}


@app.get("/containers/{container_id}")
async def get_container_status(container_id: str):
    data = service.get_container(container_id)
    if not data:
        raise HTTPException(404, "Container not found")

    return {"container_id": container_id, "status": "ok"}


@app.delete("/containers/{container_id}")
async def delete_container(container_id: str):
    logger.info(f"Request received to delete container: {container_id}")
    success = service.delete_container(container_id)
    if not success:
        logger.warning(f"Delete failed. Container not found: {container_id}")
        raise HTTPException(404, "Container not found")
    logger.info(f"Container deleted successfully: {container_id}")
    return {"status": "deleted"}

# ------------------------------
# Environment Endpoints
# ------------------------------

@app.post("/containers/{container_id}/envs")
async def create_env(container_id: str, body: CreateEnvRequest):
    logger.info(f"Creating env {body.env_id} for container {container_id}")
    success = service.create_env(container_id, body.env_id)
    if not success:
        logger.warning(f"Failed to create env. Container not found: {container_id}")
        raise HTTPException(404, "Container not found")

    logger.info(f"Environment {body.env_id} created successfully")
    return {"env_id": body.env_id, "status": "created"}


@app.get("/containers/{container_id}/envs")
async def list_envs(container_id: str):
    envs = service.list_envs(container_id)
    if envs is None:
        raise HTTPException(404, "Container not found")

    return {"envs": envs}


@app.delete("/containers/{container_id}/envs/{env_id}")
async def delete_env(container_id: str, env_id: str):
    logger.info(f"Deleting env {env_id} from container {container_id}")
    success = service.delete_env(container_id, env_id)
    if not success:
        logger.warning(f"Delete env failed. Environment not found: {env_id}")
        raise HTTPException(404, "Environment not found")

    return {"status": "deleted"}


# ------------------------------
# Execution Endpoints
# ------------------------------

@app.post("/containers/{container_id}/envs/{env_id}/execute")
async def execute_cell(container_id: str, env_id: str, body: ExecuteCellRequest):
    logger.info(f"Executing code in env {env_id} (container {container_id})")
    if not service.get_env(env_id):
        logger.warning(f"Execution failed. Environment not found: {env_id}")
        raise HTTPException(404, "Environment not found")

    # Fake execution
    return {
        "env_id": env_id,
        "result": f"Executed code: {body.code!r}",
        "stdout": "",
        "stderr": "",
    }


@app.post("/containers/{container_id}/envs/{env_id}/restart")
async def restart_env(container_id: str, env_id: str):
    logger.info(f"Restarting env {env_id} in container {container_id}")
    success = service.clear_env_state(env_id)
    if not success:
        logger.warning(f"Restart failed. Environment not found: {env_id}")
        raise HTTPException(404, "Environment not found")
    return {"env_id": env_id, "status": "restarted"}


@app.post("/containers/{container_id}/envs/{env_id}/interrupt")
async def interrupt_env(container_id: str, env_id: str):
    logger.info(f"Interrupting env {env_id} in container {container_id}")
    if not service.get_env(env_id):
        logger.warning(f"Interrupt failed. Environment not found: {env_id}")
        raise HTTPException(404, "Environment not found")

    return {"env_id": env_id, "status": "interrupted"}


@app.get("/health")
async def health():
    return {"status": "ok"}
