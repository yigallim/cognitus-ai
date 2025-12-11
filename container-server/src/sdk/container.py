from sdk.python_env import PythonEnv
from typing import Any
from .base_notebook_container import BaseNotebookContainer
from .base_python_env import BasePythonEnv


class Container(BaseNotebookContainer):
    """
    Concrete container class for the SDK.
    This class does not implement real logic yet — only boilerplate.
    """

    def __init__(
        self,
        user_id: str,
        container_id: str | None = None,
        api_url: str | None = None
    ):
        super().__init__(user_id, container_id, api_url)

    # ------------------------------
    # Container lifecycle
    # ------------------------------

    async def create(self, config: dict[str, Any] | None = None) -> None:
        raise NotImplementedError

    async def start(self) -> None:
        raise NotImplementedError

    async def stop(self) -> None:
        raise NotImplementedError

    async def destroy(self) -> None:
        raise NotImplementedError

    # ------------------------------
    # Code execution
    # ------------------------------

    async def exec(
        self,
        command: str | list[str],
        timeout: int | None = None
    ) -> dict[str, Any]:
        raise NotImplementedError

    # ------------------------------
    # File operations
    # ------------------------------

    async def write_file(self, path: str, content: str | bytes) -> None:
        raise NotImplementedError

    async def read_file(self, path: str) -> bytes:
        raise NotImplementedError

    async def delete_file(self, path: str) -> None:
        raise NotImplementedError

    async def list_files(self, path: str = "/") -> dict[str, Any]:
        raise NotImplementedError

    # ------------------------------
    # Status / State
    # ------------------------------

    async def get_status(self) -> dict[str, Any]:
        raise NotImplementedError

    async def reset(self) -> None:
        raise NotImplementedError

    # ------------------------------
    # Notebook Environment Management
    # ------------------------------

    async def create_python_env(self, env_id: str) -> BasePythonEnv:
        return PythonEnv(env_id)

    async def get_python_env(self, env_id: str) -> BasePythonEnv:
        return PythonEnv(env_id)

    async def list_python_envs(self) -> list[str]:
        raise NotImplementedError

    async def delete_python_env(self, env_id: str) -> None:
        raise NotImplementedError
