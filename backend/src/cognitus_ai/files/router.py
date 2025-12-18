import httpx
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import StreamingResponse
import io
import os
from typing import Annotated, List

ALLOWED_EXTENSIONS = {".csv", ".xlsx", ".json", ".txt", ".md", ".pdf"}

from cognitus_ai.auth.dependencies import get_current_user
from cognitus_ai.auth.schemas import User
from cognitus_ai.container_sdk.container import Container

router = APIRouter(prefix="/files", tags=["files"])

@router.post("/upload")
async def upload_file(
    current_user: Annotated[User, Depends(get_current_user)],
    file: UploadFile = File(...)
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")
    
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400, 
            detail=f"File extension {file_ext} not allowed. Supported: {', '.join(ALLOWED_EXTENSIONS)}"
        )
        
    try:
        container = await Container.create(str(current_user.id))
        data = await file.read()
        return await container.upload_file(file.filename, data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("", response_model=List[dict])
async def fetch_files(current_user: Annotated[User, Depends(get_current_user)]):
    try:
        container = await Container.create(str(current_user.id))
        return await container.list_files()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{file_id}/download")
async def download_file(
    file_id: str,
    current_user: Annotated[User, Depends(get_current_user)]
):
    try:
        container = await Container.create(str(current_user.id))
        file_bytes = await container.download_file(file_id)
        
        return StreamingResponse(
            io.BytesIO(file_bytes),
            media_type='application/octet-stream',
            headers={"Content-Disposition": f"attachment; filename={file_id}"}
        )
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
             raise HTTPException(status_code=404, detail="File not found")
        raise HTTPException(status_code=e.response.status_code, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{file_id}")
async def delete_file(
    file_id: str,
    current_user: Annotated[User, Depends(get_current_user)]
):
    try:
        container = await Container.create(str(current_user.id))
        return await container.delete_file(file_id)
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
             raise HTTPException(status_code=404, detail="File not found")
        raise HTTPException(status_code=e.response.status_code, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))