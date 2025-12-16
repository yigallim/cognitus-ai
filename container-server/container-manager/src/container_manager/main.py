from fastapi import FastAPI
from .container.router import router as container_router
from .envs.router import router as envs_router

app = FastAPI(title="Container Notebook API")

app.include_router(container_router)
app.include_router(envs_router)

@app.get("/health")
async def health():
    return {"status": "ok"}
