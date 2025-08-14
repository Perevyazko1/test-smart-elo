from django.core.files.base import ContentFile
from transliterate import translit

from core.models import ProductPicture, Fabric, Product
from src.api.sklad_client import SkladClient
from src.api.sklad_schemas import SkladProduct, SkladApiListResponse, SkladProductImage
from src.ms_import.config import PRODUCT_GROUPS, FABRIC_GROUPS


def _fetch_image_data(href: str):
    client = SkladClient()

    return client.get(
        href,
        SkladApiListResponse[SkladProductImage]
    )

def _get_image_data(image: SkladProductImage):
    client = SkladClient()

    return client.download_image(
        image.meta.downloadHref
    ).content

def _get_image_filename(image: SkladProductImage, product: SkladProduct):
    file_name = image.filename.replace("'", "")
    file_name = file_name.lower().replace(' ', '')
    file_name = translit(file_name, language_code='ru', reversed=True)
    return f"{product.id}__{file_name}"


def import_images(product: SkladProduct):
    # Get existing images from DB
    existing_product_images = set()
    existing_fabric_images = set()
    new_image_filenames = set()

    if product.pathName in PRODUCT_GROUPS:
        existing_product_images = set(ProductPicture.objects.filter(
            product__product_id=product.id
        ).values_list('image_filename', flat=True))
    elif product.pathName in FABRIC_GROUPS:
        existing_fabric_images = set(Fabric.objects.filter(
            fabric_id=product.id
        ).values_list('image_filename', flat=True))

    if product.images is not None:
        images_data = _fetch_image_data(product.images.meta.href)
        new_image_filenames = {_get_image_filename(img, product) for img in images_data.rows}

        # Process new images
        for image in images_data.rows:
            image_filename = _get_image_filename(image, product)

            if product.pathName in PRODUCT_GROUPS:
                if not ProductPicture.objects.filter(image_filename=image_filename).exists():
                    """Если изображения нет в БД - импортируем его и сохраняем"""
                    image_data = _get_image_data(image)
                    ProductPicture.objects.create(
                        image_filename=image_filename,
                        product=Product.objects.get(product_id=product.id)
                    ).image.save(image_filename, ContentFile(image_data))
                    continue

            if product.pathName in FABRIC_GROUPS:
                if not Fabric.objects.filter(image_filename=image_filename).exists():
                    image_data = _get_image_data(image)
                    fabric = Fabric.objects.get(fabric_id=product.id)
                    fabric.image_filename = image_filename
                    fabric.image.save(image_filename, ContentFile(image_data))
                break

    # Delete removed images
    if product.pathName in PRODUCT_GROUPS:
        images_to_delete = existing_product_images - new_image_filenames
        ProductPicture.objects.filter(image_filename__in=images_to_delete).delete()
    elif product.pathName in FABRIC_GROUPS:
        images_to_delete = existing_fabric_images - new_image_filenames
        Fabric.objects.filter(fabric_id=product.id, image_filename__in=images_to_delete).delete()
