from typing import List, Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from .schemas import Chat, ChatCreate, ChatUpdate
from .repository import chat_repository
from ..auth.dependencies import get_current_user
from ..auth.schemas import User

router = APIRouter(prefix="/chats", tags=["chats"])

@router.post("/", response_model=Chat, status_code=status.HTTP_201_CREATED)
async def create_chat(
    chat_in: ChatCreate,
    current_user: Annotated[User, Depends(get_current_user)]
):
    return await chat_repository.create(current_user.email, chat_in)

@router.get("/", response_model=List[Chat])
async def list_chats(
    current_user: Annotated[User, Depends(get_current_user)]
):
    return await chat_repository.list_by_user(current_user.email)

@router.get("/{chat_id}", response_model=Chat)
async def get_chat(
    chat_id: str,
    current_user: Annotated[User, Depends(get_current_user)]
):
    chat = await chat_repository.get_by_id(chat_id, current_user.email)
    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found"
        )
    return chat

@router.patch("/{chat_id}", response_model=Chat)
async def rename_chat(
    chat_id: str,
    chat_in: ChatUpdate,
    current_user: Annotated[User, Depends(get_current_user)]
):
    chat = await chat_repository.update(chat_id, current_user.email, chat_in)
    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found or could not be updated"
        )
    return chat

@router.delete("/{chat_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_chat(
    chat_id: str,
    current_user: Annotated[User, Depends(get_current_user)]
):
    success = await chat_repository.delete(chat_id, current_user.email)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found or could not be deleted"
        )
    return None
