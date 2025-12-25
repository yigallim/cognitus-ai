import httpx
from typing import Any, Dict


AGENT_CHAT_URL = "http://localhost:9090/chat"


async def forward_request_to_agent(session_id: str, user_instruction: str, timeout: int = 10) -> Dict[str, Any]:
    """Forward a request to the local agent and return the JSON response.

    Raises httpx.HTTPStatusError for non-2xx responses and httpx.RequestError for network issues.
    """
    payload = {
        "user_instruction": user_instruction,
        "session_id": session_id,
    }

    async with httpx.AsyncClient(timeout=timeout) as client:
        resp = await client.post(AGENT_CHAT_URL, json=payload)
        resp.raise_for_status()
        return resp.json()
