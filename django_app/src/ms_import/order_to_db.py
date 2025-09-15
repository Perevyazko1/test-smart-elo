import logging
from typing import Any, Dict

from core.models import Order, Agent, AgentTag
from src.api.sklad_schemas import SkladOrderExpandProjectPositionsAssortment
from src.ms_import.config import DEFAULT_URGENCY_LEVEL
from src.ms_import.lib import parse_datetime, get_attribute_value
from staff.models import Employee

logger = logging.getLogger(__name__)


def _collect_defaults(order: SkladOrderExpandProjectPositionsAssortment) -> Dict[str, Any]:
    value = int(get_attribute_value("Срочность", order.attributes) or DEFAULT_URGENCY_LEVEL)
    urgency = value if 1 <= value <= 4 else DEFAULT_URGENCY_LEVEL
    return {
        "number": order.name,
        "order_id": order.id,
        "updated": parse_datetime(order.updated),
        "moment": parse_datetime(order.moment),
        "urgency": urgency,
        "project": order.project.name if order.project else "",
        "planned_date": parse_datetime(get_attribute_value("Произв. (пл. Дата):", order.attributes)),
        "comment_case": get_attribute_value("Коммент. (чехол):", order.attributes),
        "comment_base": get_attribute_value("Коммент. (каркас):", order.attributes),
        "status": "0",
        "inner_number": get_attribute_value("Вх. заказ (№)", order.attributes),
    }

def _get_agent(order: SkladOrderExpandProjectPositionsAssortment) -> Agent:
    tags = []

    for tag in order.agent.tags:
        client_tag, _ = AgentTag.objects.get_or_create(name=tag)
        tags.append(client_tag.id)

    client, _ = Agent.objects.update_or_create(
        api_id=order.agent.id,
        defaults={
            "name": order.agent.name,
        }
    )
    client.tags.set(tags)

    return client



def _get_owner(order: SkladOrderExpandProjectPositionsAssortment) -> Employee:
    user = Employee.objects.filter(api_id=order.owner.id).first()
    if user:
        return user

    user = Employee.objects.filter(
        first_name=order.owner.firstName,
        last_name=order.owner.lastName,
        patronymic=order.owner.middleName,
    ).first()

    if user:
        user.api_id = order.owner.id
        user.save(update_fields=["api_id"])
        return user

    logger.error(f"Пользователь не найден: {order.owner.name} ({order.owner.id})")
    raise ValueError(f"Пользователь не найден: {order.owner.name} ({order.owner.id})")



def order_to_db(order: SkladOrderExpandProjectPositionsAssortment):
    data = _collect_defaults(order)

    try:
        obj =  Order.objects.filter(order_id=order.id).first()

        if obj is None:
            owner = _get_owner(order)
            agent = _get_agent(order)
            # Создаем новый объект
            obj = Order.objects.create(
                owner=owner,
                agent=agent,
                **data
            )
            created = True

        else:
            created = False
            # Вычисляем изменившиеся поля
            changed_fields: Dict[str, Any] = {}
            for field, new_value in data.items():
                if getattr(obj, field) != new_value:
                    setattr(obj, field, new_value)
                    changed_fields[field] = new_value

            if obj.owner is None:
                obj.owner = _get_owner(order)
                changed_fields["owner"] = obj.owner

            if obj.agent is None:
                obj.agent = _get_agent(order)
                changed_fields["agent"] = obj.agent

            if changed_fields:
                # Обновляем только изменившиеся поля
                obj.save(update_fields=list(changed_fields.keys()))

        return obj, created

    except Exception as e:
        logger.error(f"❌ Ошибка в order_to_db для заказа {order.id}: {e}", exc_info=True)
        raise
