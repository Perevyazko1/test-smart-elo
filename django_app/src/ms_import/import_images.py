import logging

from django.core.files.base import ContentFile
from transliterate import translit

from core.models import ProductPicture, Fabric, Product, FabricPicture
from src.api.sklad_client import SkladClient
from src.api.sklad_schemas import SkladProduct, SkladApiListResponse, SkladProductImage
from src.ms_import.config import PRODUCT_GROUPS, FABRIC_GROUPS

logger = logging.getLogger(__name__)


def _fetch_image_data(href: str):
    """
    Получает список изображений для продукта/ткани.
    """
    client = SkladClient()
    return client.get(
        href,
        SkladApiListResponse[SkladProductImage]
    )


def _get_image_data(image: SkladProductImage):
    """
    Загружает бинарные данные изображения.
    """
    client = SkladClient()
    response = client.download_image(image.meta.downloadHref)
    if response:
        return response.content
    return None


def _get_image_filename(image: SkladProductImage, product: SkladProduct):
    """
    Формирует имя файла изображения.
    """
    file_name = image.filename.replace("'", "")
    file_name = file_name.lower().replace(' ', '')
    file_name = translit(file_name, language_code='ru', reversed=True)
    return f"{product.id}__{file_name}"


def import_images(product: SkladProduct):
    """
    Импортирует и обновляет изображения для продукта или ткани.
    """
    if not product.images or not product.images.meta.href:
        logger.info(f"Нет изображений для продукта/ткани {product.name} ({product.id})")
        return

    is_product = product.pathName in PRODUCT_GROUPS
    is_fabric = product.pathName in FABRIC_GROUPS

    if not is_product and not is_fabric:
        logger.info(f"Продукт {product.name} ({product.id}) не относится к целевым группам.")
        return

    images_data = _fetch_image_data(product.images.meta.href)
    if not images_data.rows:
        logger.info(f"Нет изображений в ответе API для {product.name} ({product.id})")
        # Логика удаления всех старых изображений, если в API их нет
        if is_product:
            ProductPicture.objects.filter(product__product_id=product.id).delete()
        elif is_fabric:
            FabricPicture.objects.filter(fabric__fabric_id=product.id).delete()
        return

    new_image_filenames = {_get_image_filename(img, product) for img in images_data.rows}

    # Удаление старых изображений
    if is_product:
        existing_filenames = set(ProductPicture.objects.filter(
            product__product_id=product.id
        ).values_list('image_filename', flat=True))
        images_to_delete = existing_filenames - new_image_filenames
        ProductPicture.objects.filter(image_filename__in=images_to_delete).delete()
    elif is_fabric:
        existing_filenames = set(FabricPicture.objects.filter(
            fabric__fabric_id=product.id
        ).values_list('image_filename', flat=True))
        images_to_delete = existing_filenames - new_image_filenames
        FabricPicture.objects.filter(image_filename__in=images_to_delete).delete()

    # Загрузка и сохранение новых изображений
    for image in images_data.rows:
        image_filename = _get_image_filename(image, product)
        image_data = _get_image_data(image)

        if not image_data:
            logger.error(f"Не удалось загрузить данные изображения для файла {image.filename}.")
            continue

        if is_product:
            if not ProductPicture.objects.filter(image_filename=image_filename).exists():
                try:
                    db_product = Product.objects.get(product_id=product.id)
                    pic = ProductPicture.objects.create(
                        image_filename=image_filename,
                        product=db_product
                    )
                    pic.image.save(image_filename, ContentFile(image_data))
                    logger.info(f"Изображение {image_filename} создано для продукта {db_product.name}")
                except Product.DoesNotExist:
                    logger.error(f"Продукт с ID {product.id} не найден в БД. Изображение не сохранено.")
                except Exception as e:
                    logger.error(f"Ошибка при сохранении изображения для продукта {product.id}: {e}")

        elif is_fabric:
            if not FabricPicture.objects.filter(image_filename=image_filename).exists():
                try:
                    db_fabric = Fabric.objects.get(fabric_id=product.id)
                    pic = FabricPicture.objects.create(
                        image_filename=image_filename,
                        fabric=db_fabric
                    )
                    pic.image.save(image_filename, ContentFile(image_data))
                    logger.info(f"Изображение {image_filename} создано для ткани {db_fabric.name}")
                except Fabric.DoesNotExist:
                    logger.error(f"Ткань с ID {product.id} не найдена в БД. Изображение не сохранено.")
                except Exception as e:
                    logger.error(f"Ошибка при сохранении изображения для ткани {product.id}: {e}")
