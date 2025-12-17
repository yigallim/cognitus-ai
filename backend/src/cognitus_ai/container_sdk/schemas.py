from pydantic import BaseModel, Field
from datetime import datetime, timezone
from uuid import UUID

class FileMetadata(BaseModel):
    id: str
    filename: str
    user_id: str
    uploaded_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class FileResponse(BaseModel):
    id: str
    filename: str
    size: int
    uploadedAt: str
