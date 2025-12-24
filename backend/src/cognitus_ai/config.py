import os
import yaml
from typing import List
from pydantic import BaseModel, Field, ConfigDict
from string import Template
from dotenv import load_dotenv

load_dotenv()

class LLMSettings(BaseModel):
    model: str
    api_key: str
    base_url: str
    temperature: float = 0.2
    top_p: float = 0.5

class RedisSettings(BaseModel):
    host: str = "127.0.0.1"
    port: int = 6379
    db: int = 0

class MongoSettings(BaseModel):
    url: str = "mongodb://localhost:27017"
    database: str = "cognitus_ai"

class AuthSettings(BaseModel):
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7

class Config(BaseModel):
    llm: LLMSettings
    redis: RedisSettings
    mongo: MongoSettings
    cors_origin: List[str]
    auth: AuthSettings

    model_config = ConfigDict(
        extra="ignore",
        populate_by_name=True
    )

def load_config(config_path: str = "config.yaml") -> Config:
    with open(config_path, "r") as f:
        raw_yaml = f.read()
        expanded_yaml = Template(raw_yaml).safe_substitute(os.environ)
        config_dict = yaml.safe_load(expanded_yaml)
        return Config(**config_dict)

config = load_config()
