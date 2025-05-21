from staff.models import Department

from ...models import Product, ProductionStep, Fabric

from ..adapters.order_adapter import ProductEntity
from ..config import PRODUCT_GROUPS, FABRIC_GROUPS


class ProductEntityToDB:
    def execute(self, product_entity: ProductEntity):
        if product_entity.group in PRODUCT_GROUPS:
            self._save_product(product_entity)
        elif product_entity.group in FABRIC_GROUPS:
            self._save_fabric(product_entity)
        else:
            print(f"Ошибка сохранения сущности продукта при импорте: неизвестная группа {product_entity.group}")

    @staticmethod
    def _save_fabric(product_entity: ProductEntity):
        Fabric.objects.update_or_create(
            fabric_id=product_entity.id,
            defaults={
                'name': product_entity.name
            }
        )

    @staticmethod
    def _save_product(product_entity: ProductEntity):
        product = Product.objects.update_or_create(
            name=product_entity.name,
            defaults={
                'product_id': product_entity.id,
                'type': product_entity.type,
                'group': product_entity.group,
            }
        )

        # При добавлении продукта проверяем, является ли он изделием.
        # Если таковым не является и продукт новый для системы - создаем конструкторский этап.
        if product[1]:
            ProductionStep.objects.update_or_create(
                department=Department.objects.get(number=1),
                product=product[0],
            )
