import logging

from core.models import OrderProduct, Product, Order, Fabric, Assignment
from core.services.assignment_generator import AssignmentGenerator
from src.ms_import.create_order_products import OrderProductEntity

logger = logging.getLogger()


def _check_difference(order_product: OrderProduct, defaults: dict):
    for key, value in defaults.items():
        if getattr(order_product, key) != value:
            print(f"Field '{key}' differs: {getattr(order_product, key)} != {value}")
            return True
    return False


def _create_order_product(series_id: str, defaults: dict):
    return OrderProduct.objects.update_or_create(
        series_id=series_id,
        defaults=defaults
    )


def order_product_to_db(order_product_entity: OrderProductEntity):
    op_qs = OrderProduct.objects.filter(series_id=order_product_entity.series_id)

    defaults = {
        'product': Product.objects.get(product_id=order_product_entity.product_id),
        'order': Order.objects.get(order_id=order_product_entity.order_id),
        'main_fabric': Fabric.objects.filter(fabric_id=order_product_entity.main_fabric_id).first(),
        'second_fabric': Fabric.objects.filter(fabric_id=order_product_entity.second_fabric_id).first(),
        'third_fabric': Fabric.objects.filter(fabric_id=order_product_entity.third_fabric_id).first(),
        'quantity': order_product_entity.quantity,
        'price': order_product_entity.price,
        'urgency': order_product_entity.urgency,
        'shipped': order_product_entity.shipped,
    }

    if op_qs.exists():
        product = Product.objects.get(product_id=order_product_entity.product_id)
        op = op_qs.first()
        if str(op.product.product_id) != str(order_product_entity.product_id):
            has_active_assignments = Assignment.objects.filter(order_product=op).exclude(status="await").exists()
            if has_active_assignments:
                error = (
                    f"Attempt to overwrite product with series_id {order_product_entity.series_id} "
                    f"old product: {op.product.name} "
                    f"old product_id: {op.product.product_id} \n"
                    f"new product: {product.name}"
                    f"new product_id: {order_product_entity.product_id}"
                )
                logger.error(error)
                raise ValueError(error)
            else:
                op.delete()
                order_product, _ = _create_order_product(order_product_entity.series_id, defaults)
                AssignmentGenerator().init_order_product_assignments(order_product)
                print("🎫 Changed 🎫")
        else:
            if _check_difference(op, defaults):
                _create_order_product(order_product_entity.series_id, defaults)
                print("🎫 Updated 🎫")
            else:
                print("🎫 No difference 🎫")
    else:
        order_product, _ = _create_order_product(order_product_entity.series_id, defaults)
        AssignmentGenerator().init_order_product_assignments(order_product)
        print("🎫 Created 🎫")
