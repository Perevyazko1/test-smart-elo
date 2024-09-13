from django.db import transaction

from ..adapters.create_order_product_entities import OrderProductEntity
from ...models import OrderProduct, Product, Order, Fabric
from ...services.assignment_generator import AssignmentGenerator


class OrderProductEntityToDB:
    @staticmethod
    @transaction.atomic
    def execute(order_product_entity: OrderProductEntity):
        order_product = OrderProduct.objects.update_or_create(
            series_id=order_product_entity.series_id,
            defaults={
                'product': Product.objects.get(product_id=order_product_entity.product_id),
                'order': Order.objects.get(order_id=order_product_entity.order_id),
                'main_fabric': Fabric.objects.filter(fabric_id=order_product_entity.main_fabric_id).first(),
                'second_fabric': Fabric.objects.filter(fabric_id=order_product_entity.second_fabric_id).first(),
                'third_fabric': Fabric.objects.filter(fabric_id=order_product_entity.third_fabric_id).first(),
                'quantity': order_product_entity.quantity,
                'price': order_product_entity.price,
                'urgency': order_product_entity.urgency,
            }
        )

        # Добавляем проверку и обработку новых поступающих заказов
        # Если позиция заказа новая - создать по ней стартовые наряды
        if order_product[1]:
            AssignmentGenerator().init_order_product_assignments(order_product[0])
