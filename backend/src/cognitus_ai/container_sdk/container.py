import httpx
from cognitus_ai.database import db
from .repository import FileRepository
from .schemas import FileMetadata

class Container:
    def __init__(self, user_id: str):
        self.user_id = user_id
        self.api_url: str | None = None
        self.file_repo = FileRepository(db)

    @classmethod
    async def create(cls, user_id: str):
        instance = cls(user_id)
        user = await db["users"].find_one({"id": user_id})
        
        if not user:
            raise ValueError(f"User {user_id} not found")
            
        ip = user.get("container_ip")
        if not ip:
            raise ValueError(f"Container IP address not found for user {user_id}")
        
        instance.api_url = f"http://{ip}:8888"
        instance.api_url = f"http://localhost:8888" # TODO remove
        return instance

    def _check_connection(self):
        if not self.api_url:
            raise RuntimeError(
                "Container not initialized. Use 'await Container.create(user_id)' to instantiate."
            )

    async def list_files(self) -> list[dict]:
        self._check_connection()
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{self.api_url}/files")
            response.raise_for_status()
            all_files = response.json()
            
            user_file_ids = await self.file_repo.get_user_file_ids(self.user_id)
            return [f for f in all_files if f["id"] in user_file_ids]

    async def upload_file(self, filename: str, data: bytes) -> dict:
        self._check_connection()
        async with httpx.AsyncClient() as client:
            files = {"file": (filename, data)}
            response = await client.post(f"{self.api_url}/files/upload", files=files)
            response.raise_for_status()
            result = response.json()
            
            metadata = FileMetadata(
                id=filename,
                filename=filename,
                user_id=self.user_id
            )
            await self.file_repo.save_file_metadata(metadata)
            
            return result

    async def download_file(self, file_id: str) -> bytes:
        self._check_connection()
        
        if not await self.file_repo.is_file_owned_by_user(file_id, self.user_id):
            raise PermissionError(f"Access denied: You do not own file {file_id}")

        async with httpx.AsyncClient() as client:
            response = await client.get(f"{self.api_url}/files/{file_id}/download")
            response.raise_for_status()
            return response.content

    async def delete_file(self, file_id: str) -> dict:
        self._check_connection()
        
        if not await self.file_repo.is_file_owned_by_user(file_id, self.user_id):
            raise PermissionError(f"Access denied: You do not own file {file_id}")

        async with httpx.AsyncClient() as client:
            response = await client.delete(f"{self.api_url}/files/{file_id}")
            response.raise_for_status()
            result = response.json()
            
            await self.file_repo.delete_file_metadata(file_id, self.user_id)
            
            return result


