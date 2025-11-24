"""Initial methods and scripts."""
import logging
from urllib.parse import quote

from core.models import Fabric
from src.api.sklad_client import SkladClient
from src.api.sklad_schemas import SkladApiListResponse, SkladProduct

logger = logging.getLogger(__name__)


def init_data():
    """Функция для активации скриптов через вызов url /init"""
    print('ИНИЦИАЛИЗАЦИЯ ФУНКЦИИ')

    target_fabrics = Fabric.objects.filter(
        fabric_id__isnull=False,
        barcode__isnull=True
    )

    client = SkladClient()

    for fabric in target_fabrics:
        encoded_name = quote(fabric.name)
        product_list = client.get(
            f'entity/product?search={encoded_name}&archived=false',
            SkladApiListResponse[SkladProduct]
        )
        print(product_list.meta.size, fabric.name)
        if product_list.meta.size == 1:
            fabric.barcode = product_list.rows[0].barcodes[0].ean13 if product_list.rows[0].barcodes else None
            fabric.save()
        else:
            success = False

            if product_list.meta.size > 1:
                for product in product_list.rows:
                    if product.name == fabric.name:
                        fabric.barcode = product.barcodes[0].ean13 if product.barcodes else None
                        fabric.save()
                        success = True
                        break
            if not success:
                print("Ткань: ", fabric.name)
                print("Найдено количество: ", product_list.meta.size)
                print("Реши проблему кабанчиком 🐗")

    print('PASS')
    return f"Oki"