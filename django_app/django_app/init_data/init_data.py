"""Initial methods and scripts."""
import logging
from pprint import pprint

from django.core.files.base import ContentFile
from transliterate import translit

from core.models import Fabric, FabricPicture
from src.api.sklad_client import SkladClient


logger = logging.getLogger(__name__)


def init_data():
    """Функция для активации скриптов через вызов url /init"""
    print('ИНИЦИАЛИЗАЦИЯ ФУНКЦИИ')

    client = SkladClient()

    for fabric in Fabric.objects.all():
        try:
            ms_fabric: dict = client.get(f'entity/product/{fabric.fabric_id}/?expand=images')
            images = ms_fabric.get("images", None)

            if not images:
                continue

            rows = images.get("rows", None)
            for image in rows:
                """
                Формирует имя файла изображения.
                """
                file_name = image["filename"].replace("'", "")
                file_name = file_name.lower().replace(' ', '')
                file_name = translit(file_name, language_code='ru', reversed=True)
                image_filename = f"{fabric.id}__{file_name}"


                response = client.download_image(image['meta']['downloadHref'])

                if not response:
                    continue


                image_content = response.content

                try:
                    pic, created = FabricPicture.objects.update_or_create(
                        image_filename=image_filename,
                        fabric=fabric
                    )
                    if not created:
                        continue
                    pic.image.save(image_filename, ContentFile(image_content))
                    logger.info(f"Изображение {image_filename} создано для ткани {fabric.name}")
                except Fabric.DoesNotExist:
                    logger.error(f"Ткань с ID {fabric.id} не найдена в БД. Изображение не сохранено.")
                except Exception as e:
                    logger.error(f"Ошибка при сохранении изображения для ткани {fabric.id}: {e}")

        except Exception as e:
            continue

    print('PASS')
    return f"Oki"
