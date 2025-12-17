from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
import pwd

class Settings(BaseSettings):
    username: str

    @property
    def home_path(self) -> str:
        return pwd.getpwnam(self.username).pw_dir

    model_config = SettingsConfigDict(env_file=".env")

@lru_cache
def get_settings():
    return Settings()
