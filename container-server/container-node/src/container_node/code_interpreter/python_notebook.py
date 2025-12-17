import os
import nbformat
from typing import Any, Dict, Optional

from nbclient import NotebookClient
from nbclient.exceptions import CellExecutionError, DeadKernelError
from jupyter_core.utils import ensure_async


class PythonNotebook:
    """
    Minimal Jupyter notebook executor.
    - Stateful kernel
    - Append or overwrite cells
    - Structured outputs
    """

    def __init__(
        self,
        work_directory: str = "~",
        notebook_name: str = "code.ipynb",
        timeout: int = 300,
    ):
        self.work_directory = work_directory
        self.notebook_path = os.path.join(work_directory, notebook_name)

        os.makedirs(work_directory, exist_ok=True)

        self.nb = nbformat.v4.new_notebook(
            metadata={
                "kernelspec": {
                    "name": "python",
                    "language": "python",
                    "display_name": "Python",
                }
            }
        )

        self.client = NotebookClient(self.nb, timeout=timeout)

    # --------------------------------------------------
    # Kernel lifecycle
    # --------------------------------------------------

    async def _kernel_running(self) -> bool:
        if self.client.kc is None:
            return False
        return await ensure_async(self.client.kc.is_alive())

    async def reset_kernel(self):
        if await self._kernel_running():
            await self.client._async_cleanup_kernel()

        self.client.create_kernel_manager()
        await self.client.async_start_new_kernel(cwd=self.work_directory)
        await self.client.async_start_new_kernel_client()

    # --------------------------------------------------
    # Cell execution
    # --------------------------------------------------

    async def execute(
        self,
        code: str,
        cell_index: Optional[int] = None,
        reset: bool = False,
    ) -> Dict[str, Any]:
        """
        Execute Python code in the notebook.

        Args:
            code: Python source code
            cell_index: overwrite cell index, or append if None
            reset: restart kernel before execution
        """

        if reset or not await self._kernel_running():
            await self.reset_kernel()

        if cell_index is None or cell_index >= len(self.nb.cells):
            self.nb.cells.append(nbformat.v4.new_code_cell(code))
            cell_index = len(self.nb.cells) - 1
        else:
            self.nb.cells[cell_index] = nbformat.v4.new_code_cell(code)

        cell = self.nb.cells[cell_index]

        try:
            await self.client.async_execute_cell(cell, cell_index)
        except CellExecutionError:
            pass
        except DeadKernelError:
            await self.reset_kernel()
            raise RuntimeError("Kernel died and was restarted")

        nbformat.write(self.nb, self.notebook_path)

        return self._format_outputs(cell.outputs, cell_index)

    # --------------------------------------------------
    # Output formatting
    # --------------------------------------------------

    def _format_outputs(self, outputs, cell_index: int) -> Dict[str, Any]:
        print()
        if not outputs:
            return {"cell_index": cell_index, "output": ""}

        formatted = []
        for output in outputs:
            formatted.append(self._format_single_output(output))

        return {
            "cell_index": cell_index,
            "output": formatted if len(formatted) > 1 else formatted[0],
        }

    def _format_single_output(self, output) -> Any:
        ot = output.get("output_type")

        if ot == "stream":
            return output.get("text", "")

        if ot in ("execute_result", "display_data"):
            data = output.get("data", {})
            if "text/plain" in data:
                return data["text/plain"]
            return data

        if ot == "error":
            return {
                "type": "error",
                "traceback": output.get("traceback", []),
            }

        return output

