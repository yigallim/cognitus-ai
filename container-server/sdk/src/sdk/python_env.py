from typing import Any
from sdk.base_python_env import BasePythonEnv


class PythonEnv(BasePythonEnv):
    """
    Minimal concrete implementation of BasePythonEnv.
    This does NOT execute real Python code — just boilerplate for SDK usage.
    """

    def __init__(self, env_id: str):
        super().__init__(env_id)

    async def execute_cell(self, code: str, timeout: int | None = None) -> dict[str, Any]:
        return {
            "stdout": "",
            "stderr": "",
            "execution_count": 1,
            "result": f"Executed: {code!r}"
        }

    async def restart(self) -> None:
        pass

    async def interrupt(self) -> None:
        pass
