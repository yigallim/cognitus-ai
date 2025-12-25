import json
from typing import List, Annotated, Any
import httpx
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import StreamingResponse

from cognitus_ai.utils.parse_action import parse_action
from cognitus_ai.utils.nanoid import generate_id
from .schemas import AssistantMessage, Chat, ChatCreate, ChatUpdate, SystemMessage, UserMessage
from .repository import chat_repository
from .service import forward_request_to_agent
from ..auth.dependencies import get_current_user
from ..auth.schemas import User
from ..database import redis_client

router = APIRouter(prefix="/chats", tags=["chats"])

class ChatInstruction(BaseModel):
    user_instruction: str

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
            content = msg.content or ""
            # Remove specific prefixes/markers and trim
            for phrase in [
                "[USER INSTRUCTION]:",
                "[THIS IS AN OLD INSTRUCTION, NOT THE LATEST ONE]",
            ]:
                content = content.replace(phrase, "")
            content = content.strip()

            processed.append({
                "id": msg.id,
                "role": msg.role,
                "content": content,
            })

        elif role == "user" and msg_type == "tool_result":
            if isinstance(msg, UserMessage):
                belongs_to = processed[-1]["id"] if processed else ""
                url_prefix = "http://localhost:9090/output/"
                output_dict = {
                    "text": [msg.content],
                    "image": [f"{url_prefix}{img}" for img in msg.image] if msg.image else [],
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
    instruction = chat_in.user_instruction or ""
    chat = await chat_repository.create(current_user.email, instruction, chat_in)

    # Also forward to local agent; don't fail creation on upstream errors
    try:
        if instruction:
            await forward_request_to_agent(str(chat.id), instruction)
    except Exception:
        # Intentionally swallow errors here; chat creation should succeed regardless
        pass

    return chat

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
        raise HTTPException(status_code=404, detail="Chat not found")
    
    chat_dict = chat.model_dump()
    chat_dict["history"] = _process_history(chat.history)
    
    return Chat(**chat_dict)

@router.post("/{chat_id}/agent", status_code=status.HTTP_200_OK)
async def forward_to_local_agent(
    chat_id: str,
    body: ChatInstruction,
    current_user: Annotated[User, Depends(get_current_user)]
):
    chat = await chat_repository.get_by_id(chat_id, current_user.email)
    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found"
        )
    if len(chat.history or []) != 0:
        await chat_repository.add_message(
            chat_id,
            current_user.email,
            {
                "id": generate_id(),
                "role": "user",
                "content": "[USER INSTRUCTION]: " + body.user_instruction,
                "type": "instruction",
            },
        )

    payload = {
        "user_instruction": body.user_instruction,
        "session_id": chat_id,
    }
    try:
        resp_json = await forward_request_to_agent(chat_id, body.user_instruction)
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=e.response.text)
    except httpx.RequestError as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"Failed to reach upstream: {e}")

    return resp_json

@router.get("/{chat_id}/stream")
async def stream_chat_history_sse(
    chat_id: str,
    request: Request,
    current_user: Annotated[User, Depends(get_current_user)]
):
    chat = await chat_repository.get_by_id(chat_id, current_user.email)
    if not chat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat not found")

    history_key = f"stream:{chat_id}:history"
    status_key = f"stream:{chat_id}:status"
    
    # We track last IDs for both streams
    last_ids = {
        history_key: "0",
        status_key: "0"
    }

    history_buffer: List[dict[str, Any]] = list(chat.history or [])
    processed_len: int = len(_process_history(history_buffer))

    async def event_generator():
        nonlocal processed_len
        while True:
            if await request.is_disconnected():
                break

            try:
                # Read from both streams
                events = await redis_client.xread(last_ids, block=2000) # type: ignore
            except Exception as e:
                yield f"event: error\ndata: {json.dumps({'error': str(e)})}\n\n"
                break

            if not events:
                continue

            for stream_name, messages in events:
                for msg_id, payload in messages:
                    raw_json = payload.get("data")
                    if not raw_json:
                        continue
                    
                    try:
                        data_dict = json.loads(raw_json)
                    except Exception:
                        continue

                    # Handle History Stream
                    if stream_name == history_key:
                        history_buffer.append(data_dict)
                        processed_now = _process_history(history_buffer)
                        new_items = processed_now[processed_len:]

                        for item in new_items:
                            yield f"id: {msg_id}\nevent: message\ndata: {json.dumps(item)}\n\n"
                        
                        processed_len = len(processed_now)
                    
                    # Handle Status Stream
                    elif stream_name == status_key:
                        yield f"id: {msg_id}\nevent: status\ndata: {json.dumps(data_dict)}\n\n"

                    # Update the last ID for this specific stream
                    last_ids[stream_name] = msg_id

    headers = {
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no"
    }

    return StreamingResponse(event_generator(), media_type="text/event-stream", headers=headers)

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

@router.get("/{chat_id}/files", response_model=dict[str, str])
async def get_chat_file_map(
    chat_id: str,
    current_user: Annotated[User, Depends(get_current_user)]
):
    file_map = await chat_repository.get_file_map(chat_id, current_user.email)
    
    if file_map is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found or file map is empty"
        )
        
    return file_map