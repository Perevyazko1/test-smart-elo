from datetime import datetime, date
from typing import Any, Optional

from src.api.sklad_schemas import SkladAttribute


def parse_datetime(value: Any) -> Optional[datetime]:
    if value in (None, ""):
        return None
    if isinstance(value, datetime):
        return value
    try:
        # Поддержка строк формата "YYYY-MM-DD HH:MM:SS.mmm" и ISO с 'T'
        s = str(value).strip().replace("Z", "+00:00")
        return datetime.fromisoformat(s)
    except Exception:
        return None


def get_attribute_value(attribute_name: str, attribute_value_list: list[SkladAttribute] | None) -> str:
    if not attribute_value_list:
        return ''
    for attribute in attribute_value_list:
        if attribute.name == attribute_name:
            return attribute.value
    return ''
