from dataclasses import dataclass
from transliterate import translit
import requests

from ..config import GET_AUTH


@dataclass
class ImageInfo:
    file_name: str
    download_url: str

    def __post_init__(self):
        self.file_name = self.file_name.lower().replace(' ', '')
        self.file_name = translit(self.file_name, language_code='ru', reversed=True)


class GetImageData:
    @staticmethod
    def execute(image_info: ImageInfo):
        """Получение бинарных данных о файле изображения"""
        return requests.get(image_info.download_url, headers=GET_AUTH).content
