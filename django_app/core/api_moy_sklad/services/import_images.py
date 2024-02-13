from django.core.files.base import ContentFile

from ..adapters.order_adapter import ProductEntity
from ..config import PRODUCT_GROUPS, FABRIC_GROUPS
from ..network.get_image_data import GetImageData, ImageInfo
from ...models import ProductPicture, Fabric, Product


class ImportImages:
    @staticmethod
    def _get_image_filename(product_entity: ProductEntity, image_info: ImageInfo) -> str:
        image_info.file_name = image_info.file_name.replace("'", "")
        return f"{product_entity.id}__{image_info.file_name}"

    @staticmethod
    def _product_image_exists(image_filename) -> bool:
        """Проверка нахождения изображения в базе данных"""
        return ProductPicture.objects.filter(image_filename=image_filename).exists()

    @staticmethod
    def _fabric_image_exists(image_filename) -> bool:
        """Проверка нахождения изображения в базе данных"""
        return Fabric.objects.filter(image_filename=image_filename).exists()

    @staticmethod
    def _get_image_data(image_info) -> bytes:
        return GetImageData.execute(image_info)

    def execute(self, product_entity: ProductEntity):
        for image_info in product_entity.images_info:
            image_filename = self._get_image_filename(product_entity, image_info)

            if product_entity.group in PRODUCT_GROUPS:
                if not self._product_image_exists(image_filename):
                    """Если изображения нет в БД - импортируем его и сохраняем"""
                    image_data = self._get_image_data(image_info)
                    ProductPicture.objects.create(
                        image_filename=image_filename,
                        product=Product.objects.get(product_id=product_entity.id)
                    ).image.save(image_filename, ContentFile(image_data))
                    continue

            if product_entity.group in FABRIC_GROUPS:
                if not self._fabric_image_exists(image_filename):
                    image_data = self._get_image_data(image_info)
                    fabric = Fabric.objects.get(fabric_id=product_entity.id)
                    fabric.image_filename = image_filename
                    fabric.save()
                    fabric.image.save(image_filename, ContentFile(image_data))
                break
