from fastapi.param_functions import Body
from fastapi import FastAPI
import subprocess
import shlex
from container_node.code_interpreter.python_notebook import PythonNotebook
from container_node.config import get_settings
from container_node.files.router import router as files_router
from container_node.environment.router import router as envs_router

app = FastAPI()
app.include_router(files_router)
app.include_router(envs_router)

@app.get("/health")
async def health_check():
    """Health check endpoint returning service status."""
    return {"status": "ok"}

@app.post("/run-command")
async def run_command(command: str = Body(..., embed=True)):
    settings = get_settings()
    home_path = settings.home_path

    response = {
        "ok": False,
        "command": command,
        "stdout": "",
        "stderr": "",
        "returncode": None,
        "error": None,
        "error_type": None,
    }

    # 1️⃣ Parse command
    try:
        cmd_list = shlex.split(command)
    except Exception as e:
        response["error"] = str(e)
        response["error_type"] = "InvalidSyntax"
        return response

    # 2️⃣ Execute command
    try:
        result = subprocess.run(
            cmd_list,
            cwd=home_path,
            capture_output=True,
            text=True,
            check=False,
        )
        response.update({
            "ok": True,
            "stdout": result.stdout,
            "stderr": result.stderr,
            "returncode": result.returncode,
        })
        return response

    except FileNotFoundError:
        response["error"] = f"{cmd_list[0]}: command not found"
        response["error_type"] = "CommandNotFound"
        response["returncode"] = 127
        return response

    except Exception as e:
        response["error"] = str(e)
        response["error_type"] = "ExecutionError"
        return response