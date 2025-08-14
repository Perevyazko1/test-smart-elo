from django.db.models import QuerySet,Sum
from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver
from django.core.cache import cache

from core.models import Assignment, AssignmentCoExecutor


def update_assignments_and_clean_cache(
        assignments_qs: QuerySet[Assignment],
        order_product__id: int,
        department__id: int | None,
        **kwargs) -> int:
    clean_all_eq_card_info_cache(order_product__id, department__id)
    return assignments_qs.update(**kwargs)


def clean_all_eq_card_info_cache(order_product__id: int, department__id: int):
    # Формируем ключи кеша, которые могут быть затронуты
    cache.delete_pattern(f'eq_card_{order_product__id}_{department__id}_*')


@receiver([post_save, pre_delete], sender=Assignment)
def clear_assignment_cache(sender, instance: Assignment, **kwargs):
    clean_all_eq_card_info_cache(instance.order_product.id, instance.department.id)


@receiver([post_save, pre_delete], sender=AssignmentCoExecutor)
def clear_assignment_cache(sender, instance: AssignmentCoExecutor, **kwargs):
    if instance.assignment.department.piecework_wages and instance.assignment.new_tariff:
        if instance.assignment.executor.piecework_wages:
            all_co_executors_sum = AssignmentCoExecutor.objects.filter(
                assignment=instance.assignment
            ).aggregate(Sum('amount')).get('amount__sum') or 0

            instance.assignment.amount = instance.assignment.new_tariff.amount - all_co_executors_sum
            instance.assignment.save()
