import json
from typing import List, Annotated, Any
from fastapi import APIRouter, Depends, HTTPException, status

from cognitus_ai.utils.parse_action import parse_action
from .schemas import AssistantMessage, Chat, ChatCreate, ChatUpdate, SystemMessage, UserMessage
from .repository import chat_repository
from ..auth.dependencies import get_current_user
from ..auth.schemas import User

router = APIRouter(prefix="/chats", tags=["chats"])

def _process_history(history: List[dict[str, Any]]) -> List[dict[str, Any]]:
    processed: List[dict[str, Any]] = []
    
    for msg_dict in history or []:
        role = msg_dict.get("role")
        msg_type = msg_dict.get("type")

        try:
            if role == "user":
                msg = UserMessage(**msg_dict)
            elif role == "assistant":
                msg = AssistantMessage(**msg_dict)
            elif role == "system":
                msg = SystemMessage(**msg_dict)
            else:
                continue
        except Exception:
            continue

        if role == "user" and msg_type == "instruction":
            processed.append({
                "id": msg.id,
                "role": msg.role,
                "content": msg.content,
            })

        elif role == "user" and msg_type == "tool_result":
            belongs_to = processed[-1]["id"] if processed else ""

            output_dict = {
                "text": [msg.content],
                "image":  ["https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aW1hZ2V8ZW58MHx8MHx8fDA%3D"]
            }
            
            processed.append({
                "id": msg.id,
                "role": "function",
                "belongsTo": belongs_to,
                "output": json.dumps(output_dict)
            })

        elif role == "assistant" and msg_type == "tool_call":
            action = parse_action(msg.content) or {}
            if action.get("action") == "task_fulfill":
                continue
            action_name = action.get("action", "execute_code")
            parameters = action.get("parameters", {}) or {}
            # Choose content based on action type
            if action_name == "execute_code":
                selected_content = parameters.get("code", "")
            elif action_name == "execute_sql_query":
                selected_content = parameters.get("sql_query", "")
            elif action_name == "export_as_csv":
                selected_content = parameters.get("sql_query", "")
            else:
                # Fallback to code, then sql_query
                selected_content = parameters.get("code", "") or parameters.get("sql_query", "")
            processed.append({
                "id": msg.id,
                "role": msg.role,
                "function_call": {
                    "name": action_name,
                    "content": selected_content,
                    "explaination": action.get("explaination", ""),
                },
            })

        elif role == "assistant" and msg_type == "final_answer":
            processed.append({
                "id": msg.id,
                "role": msg.role,
                "content": msg.content,
            })

    return processed

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
    chats = await chat_repository.list_by_user(current_user.email)
    result: List[Chat] = []
    for chat in chats:
        chat_dict = chat.model_dump()
        chat_dict["history"] = _process_history(chat.history)
        result.append(Chat(**chat_dict))
    return result

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
    chat_dict = chat.model_dump()
    chat_dict["history"] = _process_history(chat.history)
    return Chat(**chat_dict)

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

