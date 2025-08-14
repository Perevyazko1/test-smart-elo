from core.models import Product, ProductionStep, Fabric
from src.api.sklad_schemas import SkladProduct
from src.ms_import.config import FABRIC_GROUPS, PRODUCT_GROUPS
from staff.models import Department


def _save_product(product: SkladProduct):
    same_product_id= Product.objects.filter(
        product_id=product.id,
    )
    same_product_name = Product.objects.filter(
        name=product.name,
    )

    # Данный механизм нужен, так как ранее из системы выводились модификации. Поэтому работаем через name
    if same_product_name.exists():
        same_product_name = same_product_name.first()
        updated = False
        if same_product_name.product_id != product.id:
            same_product_name.product_id = product.id
            updated = True
        if same_product_name.group != product.pathName:
            same_product_name.group = product.pathName
            updated = True
        if updated:
            same_product_name.save()
        return same_product_name

    # Данный механизм нужен на случай, если товар был просто переименован
    elif same_product_id.exists():
        same_product = same_product_id.first()
        updated = False
        if same_product.name != product.name:
            same_product.name = product.name
            updated = True
        if same_product.group != product.pathName:
            same_product.group = product.pathName
            updated = True
        if updated:
            same_product.save()
        return same_product_id
    else:
        new_product = Product.objects.create(
            product_id=product.id,
            name=product.name,
            group=product.pathName,
            updated=product.updated,
        )
        ProductionStep.objects.create(
            department=Department.objects.get(number=1),
            product=new_product,
        )
        return new_product


def _save_fabric(fabric: SkladProduct):
    existing_fabric = Fabric.objects.filter(fabric_id=fabric.id).first()
    if not existing_fabric or existing_fabric.name != fabric.name:
        return Fabric.objects.update_or_create(
            fabric_id=fabric.id,
            defaults={
                'name': fabric.name
            }
        )[0]
    return existing_fabric

def product_to_db(product: SkladProduct) -> Product | Fabric | None:
    if product.pathName in FABRIC_GROUPS:
        return _save_fabric(product)
    if product.pathName in PRODUCT_GROUPS:
        return _save_product(product)
    return None
