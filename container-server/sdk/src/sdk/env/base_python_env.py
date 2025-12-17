from typing import Any
from abc import ABC, abstractmethod

class BasePythonEnv(ABC):
    """
    Represents a single Python execution environment inside a container.
    One environment = one notebook = one kernel state.
    """

    def __init__(self, env_id: str):
        self._env_id = env_id

    @property
    def env_id(self) -> str:
        return self._env_id

    # ------------------------------
    # Code execution
    # ------------------------------

    @abstractmethod
    async def execute_cell(self, code: str, timeout: int | None = None) -> dict[str, Any]:
        """
        Execute code inside the environment.
        Should return:
            - stdout
            - stderr
            - execution_count
            - result data / rich outputs
        """
        raise NotImplementedError

    # ------------------------------
    # Environment lifecycle
    # ------------------------------

    @abstractmethod
    async def restart(self) -> None:
        """Restart this environment's kernel (clears variables)."""
        raise NotImplementedError

    @abstractmethod
    async def interrupt(self) -> None:
        """Interrupt ongoing execution (similar to Jupyter's stop button)."""
        raise NotImplementedError
