from typing import Type

from django.db.models import QuerySet
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.core.cache import cache

from core.models import Assignment


def update_assignments_and_clean_cache(
        assignments_qs: QuerySet[Type[Assignment]],
        order_product__id: int,
        department__id: int | None,
        **kwargs) -> int:
    clean_eq_card_cache(order_product__id, department__id)
    return assignments_qs.update(**kwargs)


def clean_eq_card_cache(order_product__id: int, department__id: int = None):
    # Формируем ключи кеша, которые могут быть затронуты
    cache_key_assignments = f'assignments_{order_product__id}_'
    if department__id:
        cache_key_assignments += f'{department__id}_'
    cache_key_assignments += '*'

    cache.delete_pattern(cache_key_assignments)


def clean_eq_card_info_cache(order_product__id: int, department__id: int = None):
    # Формируем ключи кеша, которые могут быть затронуты
    cache_key = f'eq_card_info_{order_product__id}_{department__id}'

    cache.delete_pattern(cache_key)


@receiver([post_save, post_delete], sender=Assignment)
def clear_assignment_cache(sender, instance, **kwargs):
    clean_eq_card_cache(instance.order_product.id, instance.department.id)
    clean_eq_card_info_cache(instance.order_product.id, instance.department.id)
