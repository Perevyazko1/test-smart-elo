# from django.db.models.signals import post_save, post_delete
# from django.dispatch import receiver
# from django.core.cache import cache

# from .models import Employee

CACHE_KEY_EMPLOYEE_LIST = 'employee_list_cache_key'

# Очищаем кеш при изменении или создании сотрудника
# @receiver(post_save, sender=Employee)
# def clear_employee_cache_on_save(sender, instance, **kwargs):
#     cache.delete(CACHE_KEY_EMPLOYEE_LIST)


# Очищаем кеш при удалении сотрудника
# @receiver(post_delete, sender=Employee)
# def clear_employee_cache_on_delete(sender, instance, **kwargs):
#     cache.delete(CACHE_KEY_EMPLOYEE_LIST)
