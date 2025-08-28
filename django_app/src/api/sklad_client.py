import logging
from time import sleep
from typing import Dict, TypeVar, Type, Optional

import httpx
from httpx import Response
from pydantic import BaseModel

# Настройка логирования
logging.basicConfig(level=logging.ERROR)  # Changed from INFO to ERROR 
logger = logging.getLogger(__name__)

# Определяем тип переменную для дженерика
T = TypeVar('T')

from pathlib import Path
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
    SKLAD_API_TOKEN: str = "b6cbd1444a9cf14ee0c03efa27933a6c9cbbed14"
    SKLAD_API_URL: str = "https://api.moysklad.ru/api/remap/1.2"
    SKLAD_API_TIMEOUT: int = 30
    SKLAD_API_RETRIES: int = 3
    SKLAD_API_SLEEP_TIME: float = 1

    @staticmethod
    def get_base_dir():
        return Path(__file__).resolve().parent.parent

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()


class SkladClient:
    def __init__(self):
        self.client_settings = settings

        self.client = httpx.Client(
            base_url=settings.SKLAD_API_URL,
            headers={
                "Authorization": f"Bearer {settings.SKLAD_API_TOKEN}",
                "Content-Type": "application/json"
            },
            follow_redirects=True,
            timeout=settings.SKLAD_API_TIMEOUT
        )

    def _retry_request(self, method: str, response_type: Type[T], *args, **kwargs) -> T:
        """Декоратор для повторных попыток запроса при ошибках"""
        retries = 0
        last_exception = None

        while retries < self.client_settings.SKLAD_API_RETRIES:
            try:
                response = getattr(self.client, method)(*args, **kwargs)

                # Проверяем статус код
                response.raise_for_status()

                # Для DELETE запросов возвращаем просто Response объект
                if method == "delete":
                    return response  # Возвращаем объект Response без обработки данных

                # Затем парсим JSON для других методов
                try:
                    data = response.json()
                except Exception as json_error:
                    logger.error(f"❌ Ошибка парсинга JSON: {json_error}")
                    logger.error(f"Ответ сервера: {response.text[:500]}")
                    raise ValueError(f"Некорректный JSON в ответе: {json_error}")

                # Проверяем наличие ошибок в ответе API
                if isinstance(data, dict) and "errors" in data:
                    logger.error(f"❌ Ошибка от MoySklad: {data['errors']}")
                    raise ValueError(f"Ошибка в ответе API: {data['errors']}")

                # Если response_type это Pydantic модель, создаем экземпляр
                if hasattr(response_type, '__annotations__') and issubclass(response_type, BaseModel):
                    return response_type(**data) if isinstance(data, dict) else response_type(data)
                # Если это обычный тип (Dict, List и т.д.), возвращаем как есть
                else:
                    return data

            except httpx.HTTPStatusError as e:
                last_exception = e
                logger.error(f"❌ HTTP ошибка {e.response.status_code}: {e.response.text[:200]}")

                # Для 404 ошибки сразу возвращаем исключение без повторов
                if e.response.status_code == 404:
                    raise e

                # Для остальных критических ошибок тоже не повторяем
                if e.response.status_code in [401, 403]:
                    logger.error(f"❌ Критическая ошибка {e.response.status_code}, повторы бесполезны")
                    raise e

            except httpx.RequestError as e:
                last_exception = e
                logger.error(f"❌ Ошибка сети: {e}")

            except ValueError as e:
                last_exception = e
                logger.error(f"❌ Ошибка данных: {e}")

            except Exception as e:
                last_exception = e
                logger.error(f"❌ Неожиданная ошибка: {e}")

            retries += 1
            if retries < self.client_settings.SKLAD_API_RETRIES:
                sleep(self.client_settings.SKLAD_API_SLEEP_TIME)

        # Если дошли сюда, значит все попытки исчерпаны
        error_msg = f"⛔ Превышено максимальное количество попыток запроса. Последняя ошибка: {last_exception}"
        logger.error(error_msg)
        raise Exception(error_msg)

    def get(self, path: str, response_type: Type[T] = Dict, params: Optional[Dict] = None) -> T:
        """
            GET с поддержкой query-параметров (params кодируются httpx автоматически).
            path — это относительный путь, например: "entity/customerorder"
        """

        return self._retry_request("get", response_type, path, params=params)

    def post(self, path: str, data: Dict, response_type: Type[T] = Dict, params: Optional[Dict] = None) -> T:
        return self._retry_request("post", response_type, path, json=data, params=params)

    def put(self, path: str, data: Dict, response_type: Type[T] = Dict, params: Optional[Dict] = None) -> T:
        return self._retry_request("put", response_type, path, json=data, params=params)

    def delete(self, path: str, response_type: Type[T] = Dict, params: Optional[Dict] = None) -> T:
        return self._retry_request("delete", response_type, path, params=params)

    def download_image(self, url: str) -> Optional[Response]:
        """Загрузка и кодирование изображения в base64"""
        try:
            response = self.client.get(url, follow_redirects=True)
            response.raise_for_status()
            return response
        except httpx.RequestError as e:
            print(f"❌ Ошибка загрузки изображения: {e}")
            return None

    def __del__(self):
        """Закрываем клиент при удалении объекта"""
        if hasattr(self, 'client'):
            self.client.close()
