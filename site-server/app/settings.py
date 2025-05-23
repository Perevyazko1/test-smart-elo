import os
from pathlib import Path
from pydantic_settings import BaseSettings
from dotenv import load_dotenv


load_dotenv(os.path.join(Path(__file__).resolve().parent.parent, '.env'))


class Settings(BaseSettings):
    MEDIA_URL: str
    MEDIA_PATH: str
    API_URL: str
    DB_URL: str
    POSTGRES_SERVER: str
    POSTGRES_PORT: str
    POSTGRES_DB: str
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    ADMIN_URL: str = "/admin"
    DEBUG: bool = False
    SECURE_PROXY_SSL_HEADER: tuple = ('HTTP_X_FORWARDED_PROTO', 'https')
    SECURE_SSL_REDIRECT: bool = True
    SESSION_COOKIE_SECURE: bool = True
    CSRF_COOKIE_SECURE: bool = True

    @staticmethod
    def get_base_dir():
        return Path(__file__).resolve().parent.parent

    @property
    def media_path(self):
        path = Path("/app/media")
        try:
            path.mkdir(parents=True, exist_ok=True)
            (path / "projects").mkdir(parents=True, exist_ok=True)
        except OSError as e:
            raise RuntimeError(f"Не удалось создать директорию для медиафайлов: {path}. Ошибка: {e}")
        return path

    @property
    def media_url(self):
        return self.MEDIA_URL

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()

