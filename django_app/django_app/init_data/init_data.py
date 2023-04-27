from core.models import TechnologicalProcess
from staff.models import Department
from django.contrib.auth.models import Group
from .technological_processes import technological_processes

departments = {
    'Старт': [0, False, False],
    'Конструктора': [1, True, True],
    'Обивка': [2, False, True],
    'Пошив': [3, False, True],
    'ППУ': [4, False, False],
    'Крой': [5, False, True],
    'Лазер': [6, False, False],
    'Сборка': [7, False, True],
    'Столярка': [8, False, False],
    'Малярка': [9, False, False],
    'Упаковка': [10, False, False],
    'Подрядчики': [11, False, False],
    'Пила': [12, False, False],
    'Готово': [50, False, False],
}


groups = ['Бригадиры', 'Администраторы', 'Работники']


def init_data():
    """Инициализация базовых данных приложения"""
    for department_name, department_params in departments.items():
        Department.objects.update_or_create(
            name=department_name,
            number=department_params[0],
            defaults={
                "single": department_params[1],
                "piecework_wages": department_params[2]
            }
        )

    for group_name in groups:
        Group.objects.update_or_create(
            name=group_name
        )

    for name, schema in technological_processes.items():
        TechnologicalProcess.objects.update_or_create(
            name=name,
            defaults={
                "schema": schema
            }
        )

