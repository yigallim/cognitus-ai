from typing import Any
from abc import ABC, abstractmethod

class BaseContainer(ABC):
    """
    Abstract container class similar to e2b.Sandbox,
    but designed so each container session is tied to a specific user.
    """

    def __init__(self, user_id: str, container_id: str | None = None, api_url: str | None = None):
        self._user_id = user_id
        self._container_id = container_id
        self._api_url = api_url

    # ------------------------------
    # Container lifecycle
    # ------------------------------

    @abstractmethod
    async def create(self, config: dict[str, Any] | None = None) -> None:
        """
        Create a new isolated container environment for the given user.
        """
        raise NotImplementedError

    @abstractmethod
    async def start(self) -> None:
        """Start the container runtime."""
        raise NotImplementedError

    @abstractmethod
    async def stop(self) -> None:
        """Stop the container runtime without destroying it."""
        raise NotImplementedError

    @abstractmethod
    async def destroy(self) -> None:
        """Permanently remove the container and all resources."""
        raise NotImplementedError

    # ------------------------------
    # Code execution
    # ------------------------------

    @abstractmethod
    async def exec(
        self,
        command: str | list[str],
        timeout: int | None = None
    ) -> dict[str, Any]:
        """
        Execute a command inside the container.
        Should return stdout, stderr, exit_code, etc.
        """
        raise NotImplementedError

    # ------------------------------
    # File operations
    # ------------------------------

    @abstractmethod
    async def write_file(self, path: str, content: str | bytes) -> None:
        """Write a file inside the container."""
        raise NotImplementedError

    @abstractmethod
    async def read_file(self, path: str) -> bytes:
        """Read a file from the container."""
        raise NotImplementedError

    @abstractmethod
    async def delete_file(self, path: str) -> None:
        """Delete a file in the container."""
        raise NotImplementedError

    @abstractmethod
    async def list_files(self, path: str = "/") -> dict[str, Any]:
        """List files inside a directory in the container."""
        raise NotImplementedError

    # ------------------------------
    # Status / State
    # ------------------------------

    @abstractmethod
    async def get_status(self) -> dict[str, Any]:
        """
        Return runtime status:
            - running/stopped
            - CPU, memory usage
            - user ID
            - container ID
        """
        raise NotImplementedError

    @abstractmethod
    async def reset(self) -> None:
        """Reset the container environment (clear FS, kill running processes)."""
        raise NotImplementedError

    @property
    def user_id(self) -> str:
        return self._user_id

    @property
    def container_id(self) -> str | None:
        return self._container_id

    @property
    def api_url(self) -> str | None:
        return self._api_url
