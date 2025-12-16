from typing import Any
from abc import ABC, abstractmethod

from sdk.base_container import BaseContainer
from sdk.base_python_env import BasePythonEnv


class BaseNotebookContainer(BaseContainer, ABC):
    """
    Container that manages multiple Python notebook environments.
    """

    # ------------------------------
    # Environment Management
    # ------------------------------

    @abstractmethod
    async def create_python_env(self, env_id: str) -> BasePythonEnv:
        """
        Create a new Python execution environment inside the container.
        Each env has its own variable state (like a notebook kernel).
        """
        raise NotImplementedError

    @abstractmethod
    async def get_python_env(self, env_id: str) -> BasePythonEnv:
        """
        Retrieve an existing Python environment inside the container.
        """
        raise NotImplementedError

    @abstractmethod
    async def list_python_envs(self) -> list[str]:
        """List all environment IDs belonging to this container."""
        raise NotImplementedError

    @abstractmethod
    async def delete_python_env(self, env_id: str) -> None:
        """Delete an environment (kills kernel + removes notebook)."""
        raise NotImplementedError
