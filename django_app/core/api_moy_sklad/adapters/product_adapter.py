from .order_adapter import ProductEntity
from ..network.get_image_data import ImageInfo


class ProductAdapter:
    """Адаптер для перевода сырых данных полученных от API МоегоСклада в сущность продукта"""

    @staticmethod
    def _get__images_info(product_data: dict) -> list[ImageInfo]:
        result = []
        if product_data['images']['meta']['size'] != 0:
            for image_data in product_data['images']['rows']:
                result.append(ImageInfo(
                    file_name=image_data['filename'],
                    download_url=image_data['meta']['downloadHref']
                ))
        return result

    def execute(self, product_data: dict) -> ProductEntity:
        return ProductEntity(
            id=product_data['id'],
            name=product_data['name'],
            type='product',
            group=product_data['pathName'],
            images_info=self._get__images_info(product_data),
        )
