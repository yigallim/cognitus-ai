import os
import shutil
from pathlib import Path
from typing import List
from datetime import datetime, timezone
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse

from container_node.config import get_settings

router = APIRouter(prefix="/files", tags=["files"])

def get_upload_dir() -> Path:
    settings = get_settings()
    return Path(settings.home_path).resolve()

ALLOWED_EXTENSIONS = {'.csv', '.xlsx', '.json', '.txt', '.md', '.pdf'}

def validate_file_extension(filename: str):
    _, ext = os.path.splitext(filename)
    if ext.lower() not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400, 
            detail=f"File type not allowed. Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
        )


def get_secure_path(file_id: str) -> Path:
    upload_dir = get_upload_dir()
    try:
        target_path = (upload_dir / file_id).resolve()
        if not str(target_path).startswith(str(upload_dir)):
            raise HTTPException(status_code=403, detail="Access denied: Path outside home directory")
        return target_path
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid file ID")


@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")
    
    validate_file_extension(file.filename)
    file_path = get_secure_path(file.filename)
    
    try:
        # Ensure parent directory exists (in case file.filename has folders)
        file_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        return {
            "id": file.filename,
            "filename": file.filename,
            "size": os.path.getsize(file_path),
            "uploadedAt": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("")
async def fetch_files():
    try:
        files = []
        upload_dir = get_upload_dir()
        if upload_dir.exists():
            for file_path in upload_dir.iterdir():
                if file_path.is_file():
                    stat = file_path.stat()
                    files.append({
                        "id": file_path.name,
                        "filename": file_path.name,
                        "size": stat.st_size,
                        "uploadedAt": datetime.fromtimestamp(stat.st_ctime, tz=timezone.utc).isoformat()
                    })
        return files
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{file_id}/download")
async def download_file(file_id: str):
    try:
        file_path = get_secure_path(file_id)
        if not file_path.exists() or not file_path.is_file():
            raise HTTPException(status_code=404, detail="File not found")
        
        validate_file_extension(file_id)
            
        return FileResponse(
            path=file_path,
            filename=file_id,
            media_type='application/octet-stream'
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{file_id}")
async def delete_file(file_id: str):
    try:
        file_path = get_secure_path(file_id)
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="File not found")
        
        if file_path.is_dir():
            shutil.rmtree(file_path)
        else:
            os.remove(file_path)
            
        return {"message": f"File {file_id} deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
