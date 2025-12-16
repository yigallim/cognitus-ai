from fastapi.param_functions import Body
from fastapi import FastAPI
import subprocess
import shlex
import pwd

app = FastAPI()

@app.get("/health")
async def health_check():
    """Health check endpoint returning service status."""
    return {"status": "ok"}

@app.post("/run-command")
async def run_command(command: str = Body(..., embed=True)):
    username = "cognitus"
    home_path = pwd.getpwnam(username).pw_dir

    try:
        cmd_list = shlex.split(command)
    except Exception as e:
        return {"error": f"invalid command syntax: {e}"}

    result = subprocess.run(
        cmd_list,
        cwd=home_path,
        capture_output=True,
        text=True
    )

    return {
        "command": command,
        "stdout": result.stdout,
        "stderr": result.stderr,
        "returncode": result.returncode
    }