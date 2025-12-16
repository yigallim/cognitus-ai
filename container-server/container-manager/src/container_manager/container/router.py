from fastapi import APIRouter, HTTPException
from .service import ContainerService
from container_manager.util import logger

router = APIRouter()
service = ContainerService()

@router.get("/containers")
async def list_containers():
    return await service.list_containers()

@router.post("/containers")
async def create_container():
    logger.info("Request received to create a new container")
    container_id = await service.create_container()
    logger.info(f"Container created with ID: {container_id}")
    return {"container_id": container_id}

@router.get("/containers/{container_id}")
async def get_container_status(container_id: str):
    data = await service.get_container(container_id)
    if not data:
        raise HTTPException(404, "Container not found")

    return {"container_id": container_id, "status": "ok"}


@router.delete("/containers/{container_id}")
async def delete_container(container_id: str):
    logger.info(f"Request received to delete container: {container_id}")
    success = await service.delete_container(container_id)
    if not success:
        logger.warning(f"Delete failed. Container not found: {container_id}")
        raise HTTPException(404, "Container not found")
    logger.info(f"Container deleted successfully: {container_id}")
    return {"status": "deleted"}
