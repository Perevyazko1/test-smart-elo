from .order_adapter import ProductEntity
from ..network.get_image_data import ImageInfo


class VariantAdapter:
    """Адаптер для перевода сырых данных полученных от API МоегоСклада в сущность продукта"""

    @staticmethod
    def _get_variant_images(variant_data: dict) -> list[dict]:
        if variant_data['images']['meta']['size']:
            return variant_data['images']['rows']
        elif variant_data['product']['images']['meta']['size']:
            return variant_data['product']['images']['rows']
        else:
            return []

    def _get_images_info(self, variant_data) -> list[ImageInfo]:
        result = []
        for image_data in self._get_variant_images(variant_data):
            result.append(ImageInfo(
                file_name=image_data['filename'],
                download_url=image_data['meta']['downloadHref']
            ))
        return result

    def execute(self, variant_data: dict) -> ProductEntity:
        return ProductEntity(
            id=variant_data['id'],
            name=variant_data['name'],
            type='variant',
            group=variant_data['product']['pathName'],
            images_info=self._get_images_info(variant_data)
        )
