from pathlib import Path
import shutil
from typing import List, Optional

class FileRepository:
    def __init__(self, base_dir: Path):
        self.base_dir = base_dir

    def get_user_dir(self, user_id: str) -> Path:
        user_dir = self.base_dir / user_id
        user_dir.mkdir(parents=True, exist_ok=True)
        return user_dir

    def save_file(self, user_id: str, filename: str, file_obj) -> Path:
        user_dir = self.get_user_dir(user_id)
        file_path = user_dir / filename
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file_obj, buffer)
        return file_path

    def list_files(self, user_id: str) -> List[dict]:
        user_dir = self.base_dir / user_id
        if not user_dir.exists():
            return []
            
        files = []
        for file_path in user_dir.iterdir():
            if file_path.is_file():
                files.append({
                    "id": file_path.name,
                    "filename": file_path.name,
                    "size": file_path.stat().st_size
                })
        return files

    def get_file_path(self, user_id: str, file_id: str) -> Optional[Path]:
        file_path = self.base_dir / user_id / file_id
        if file_path.exists() and file_path.is_file():
            return file_path
        return None

    def delete_file(self, user_id: str, file_id: str) -> bool:
        file_path = self.base_dir / user_id / file_id
        if file_path.exists() and file_path.is_file():
            file_path.unlink()
            return True
        return False
