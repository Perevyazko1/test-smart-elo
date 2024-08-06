import requests
from requests import RequestException

from ..config import GET_AUTH


def solid_get_request(url, max_retries=10):
    retries = 0
    while retries < max_retries:
        try:
            response = requests.get(url, headers=GET_AUTH, timeout=30)
            # Убедитесь, что ответ успешен (например, status code 200)
            response.raise_for_status()
            return response
        except RequestException as e:
            print(f"Произошла ошибка: {e}. Попытка {retries + 1} из {max_retries}.")
            retries += 1
    raise Exception("Превышено максимальное количество попыток запроса")