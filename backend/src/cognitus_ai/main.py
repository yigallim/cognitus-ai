from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import config
from .auth.router import router as auth_router
from .files.router import router as files_router
from .chat.router import router as chat_router
from .database import mongodb_client
from contextlib import asynccontextmanager
import subprocess
import json

@asynccontextmanager
async def lifespan(app: FastAPI):
    spec = app.openapi()
    with open("./openapi.json", "w", encoding="utf-8") as f:
        json.dump(spec, f, indent=2)
    try:
        _ = subprocess.run([
            "openapi2postmanv2",
            "-s", "openapi.json",
            "-o", "postman-collection.json",
            "-p",
            "--options retainRequestBodyExamples:true"
        ], check=True, shell=True)
        print("Postman collection generated successfully.")
    except Exception as e:
        print("Failed to generate Postman collection:", e)
    yield 
    mongodb_client.close()

app = FastAPI(
    title="Cognitus AI",
    version="1.0.0",
    description="",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.cors_origin,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(files_router)
app.include_router(chat_router)

@app.get("/health", tags=["system"])
async def health():
    return {"status": "ok"}