from typing import Type

from django.db.models import QuerySet, Sum
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.core.cache import cache

from core.models import Assignment, AssignmentCoExecutor


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
def clear_assignment_cache(sender, instance: Assignment, **kwargs):
    clean_eq_card_cache(instance.order_product.id, instance.department.id)
    clean_eq_card_info_cache(instance.order_product.id, instance.department.id)


@receiver([post_save, post_delete], sender=AssignmentCoExecutor)
def clear_assignment_cache(sender, instance: AssignmentCoExecutor, **kwargs):
    if instance.assignment.department.piecework_wages:
        clean_eq_card_cache(instance.assignment.order_product.id, instance.assignment.department.id)
        clean_eq_card_info_cache(instance.assignment.order_product.id, instance.assignment.department.id)

        all_co_executors_sum = AssignmentCoExecutor.objects.filter(
            assignment=instance.assignment
        ).aggregate(Sum('amount')).get('amount__sum') or 0

        instance.assignment.amount = instance.assignment.new_tariff.amount - all_co_executors_sum
        instance.assignment.save()
