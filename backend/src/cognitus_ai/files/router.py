# import os
# from pathlib import Path
# from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
# from fastapi.responses import FileResponse
# from typing import Annotated, List

# from cognitus_ai.auth.dependencies import get_current_user
# from cognitus_ai.auth.schemas import User
# from .repository import FileRepository

# router = APIRouter(prefix="/files", tags=["files"])

# STORAGE_DIR = Path("users")

# def get_file_repository() -> FileRepository:
#     return FileRepository(STORAGE_DIR)

# ALLOWED_EXTENSIONS = {".csv", ".xlsx", ".json", ".txt", ".md", ".pdf"}

# @router.post("/upload")
# async def upload_file(
#     current_user: Annotated[User, Depends(get_current_user)],
#     file: UploadFile = File(...),
#     file_repo: FileRepository = Depends(get_file_repository)
# ):
#     if not file.filename:
#         raise HTTPException(status_code=400, detail="No filename provided")
    
#     file_ext = os.path.splitext(file.filename)[1].lower()
#     if file_ext not in ALLOWED_EXTENSIONS:
#         raise HTTPException(
#             status_code=400, 
#             detail=f"File extension {file_ext} not allowed. Supported: {', '.join(ALLOWED_EXTENSIONS)}"
#         )
        
#     try:
#         file_repo.save_file(str(current_user.id), file.filename, file.file)
#         return {
#             "id": file.filename,
#             "filename": file.filename,
#             "status": "success"
#         }
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# @router.get("", response_model=List[dict])
# async def fetch_files(
#     current_user: Annotated[User, Depends(get_current_user)],
#     file_repo: FileRepository = Depends(get_file_repository)
# ):
#     try:
#         return file_repo.list_files(str(current_user.id))
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# @router.get("/{file_id}/download")
# async def download_file(
#     file_id: str,
#     current_user: Annotated[User, Depends(get_current_user)],
#     file_repo: FileRepository = Depends(get_file_repository)
# ):
#     file_path = file_repo.get_file_path(str(current_user.id), file_id)
#     if not file_path:
#         raise HTTPException(status_code=404, detail="File not found")
        
#     return FileResponse(
#         path=file_path,
#         filename=file_id,
#         media_type='application/octet-stream'
#     )

# @router.delete("/{file_id}")
# async def delete_file(
#     file_id: str,
#     current_user: Annotated[User, Depends(get_current_user)],
#     file_repo: FileRepository = Depends(get_file_repository)
# ):
#     success = file_repo.delete_file(str(current_user.id), file_id)
#     if not success:
#         raise HTTPException(status_code=404, detail="File not found")
#     return {"message": f"File {file_id} deleted successfully"}
import os
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import FileResponse
from typing import Annotated, List

from cognitus_ai.auth.dependencies import get_current_user
from cognitus_ai.auth.schemas import User
from .repository import FileRepository

router = APIRouter(prefix="/files", tags=["files"])

STORAGE_DIR = Path("workspace")

def get_file_repository() -> FileRepository:
    return FileRepository(STORAGE_DIR)

ALLOWED_EXTENSIONS = {".csv", ".xlsx", ".json", ".txt", ".md", ".pdf"}

@router.post("/upload")
async def upload_file(
    current_user: Annotated[User, Depends(get_current_user)],
    file: UploadFile = File(...),
    file_repo: FileRepository = Depends(get_file_repository)
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")
    
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400, 
            detail=f"File extension {file_ext} not allowed."
        )
        
    try:
        file_repo.save_file(file.filename, file.file)
        return {
            "id": file.filename,
            "filename": file.filename,
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("", response_model=List[dict])
async def fetch_files(
    current_user: Annotated[User, Depends(get_current_user)],
    file_repo: FileRepository = Depends(get_file_repository)
):
    try:
        return file_repo.list_files()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{file_id}/download")
async def download_file(
    file_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    file_repo: FileRepository = Depends(get_file_repository)
):
    file_path = file_repo.get_file_path(file_id)
    if not file_path:
        raise HTTPException(status_code=404, detail="File not found")
        
    return FileResponse(
        path=file_path,
        filename=file_id,
        media_type='application/octet-stream'
    )

@router.delete("/{file_id}")
async def delete_file(
    file_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    file_repo: FileRepository = Depends(get_file_repository)
):
    success = file_repo.delete_file(file_id)
    if not success:
        raise HTTPException(status_code=404, detail="File not found")
    return {"message": f"File {file_id} deleted successfully"}