from dataclasses import dataclass
from transliterate import translit
import requests

from ..config import GET_AUTH
from ..services.solid_requests import solid_get_request


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
        return solid_get_request(image_info.download_url).content
