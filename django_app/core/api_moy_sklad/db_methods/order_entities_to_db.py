from ...models import Order

from ..adapters.order_adapter import OrderEntity


def order_entities_to_db(order_entity: OrderEntity):
    # TODO добавить обработчик ошибок сохранения
    try:
        Order.objects.update_or_create(
            order_id=order_entity.order_id,
            defaults={
                "number": order_entity.number,
                "moment": order_entity.moment,
                "urgency": order_entity.urgency,
                "project": order_entity.project,
                "planned_date": order_entity.planned_date,
                "comment_case": order_entity.comment_case,
                "comment_base": order_entity.comment_base,
            }
        )
    except Exception as e:
        print(f"Ошибка сохранения заказа при импорте: {e}")
