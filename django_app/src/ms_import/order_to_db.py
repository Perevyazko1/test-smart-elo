import logging
from typing import Any, Dict

from core.models import Order
from src.api.sklad_schemas import SkladOrderExpandProjectPositionsAssortment
from src.ms_import.config import DEFAULT_URGENCY_LEVEL
from src.ms_import.lib import parse_datetime, get_attribute_value

logger = logging.getLogger(__name__)


def _collect_defaults(order: SkladOrderExpandProjectPositionsAssortment) -> Dict[str, Any]:
    value = int(get_attribute_value("Срочность", order.attributes) or DEFAULT_URGENCY_LEVEL)
    urgency = value if 1 <= value <= 4 else DEFAULT_URGENCY_LEVEL
    return {
        "number": order.name,
        "moment": parse_datetime(order.moment),
        "urgency": urgency,
        "project": order.project.name if order.project else "",
        "planned_date": parse_datetime(get_attribute_value("Произв. (пл. Дата):", order.attributes)),
        "comment_case": get_attribute_value("Коммент. (чехол):", order.attributes),
        "comment_base": get_attribute_value("Коммент. (каркас):", order.attributes),
        "status": "0",
        "inner_number": get_attribute_value("Вх. заказ (№)", order.attributes),
    }


def order_to_db(order: SkladOrderExpandProjectPositionsAssortment):
    data = _collect_defaults(order)

    try:
        # Блокируем строку
        obj = (
            Order.objects.select_for_update()
            .filter(order_id=order.id)
            .first()
        )

        if obj is None:
            # Создаем новый объект
            obj = Order(order_id=order.id, **data)
            obj.save()
            created = True
        else:
            created = False
            # Вычисляем изменившиеся поля
            changed_fields: Dict[str, Any] = {}
            for field, new_value in data.items():
                if getattr(obj, field) != new_value:
                    setattr(obj, field, new_value)
                    changed_fields[field] = new_value

            if changed_fields:
                # Обновляем только изменившиеся поля
                obj.save(update_fields=list(changed_fields.keys()))

        return obj, created

    except Exception as e:
        logger.error(f"❌ Ошибка в order_to_db для заказа {order.id}: {e}", exc_info=True)
        raise