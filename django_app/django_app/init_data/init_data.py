import os

from core.models import TechnologicalProcess
from staff.models import Department, Employee
from django.contrib.auth.models import Group
from django.core.files import File
from .technological_processes import technological_processes
from .employees import employees


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

groups = ['Бригадиры', 'Администраторы', 'Работники', 'Тарификации', 'Утверждение тарификаций']


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
        path_to_image_file = os.path.join(os.path.dirname(__file__), 'images', f'{name}.png')
        with open(path_to_image_file, 'rb') as f:
            tech_process = TechnologicalProcess.objects.update_or_create(
                name=name,
                defaults={
                    "schema": schema
                }
            )[0]
            tech_process.image.delete()
            tech_process.image.save(f'{name}.png', File(f), save=True)

    if not Employee.objects.filter(username='root').exists():
        user = Employee.objects.create_superuser(
            username='root',
            email='c3mk@mail.ru',
            password='RLcb!!Dk',
        )
        user.first_name = 'Администратор'
        user.pin_code = 147858
        user.save()

    if not Employee.objects.filter(username='Kharchenko_D').exists():
        user2 = Employee.objects.create_superuser(
            username='Kharchenko_D',
            email='lameblas@gmail.com',
            password='Dmitriy_852',
        )

    for username, params in employees.items():
        user = Employee.objects.filter(username=username)
        if user.exists():
            user = user[0]
            user.set_password(params['password'])
            user.first_name = params['first_name']
            user.last_name = params['last_name']
            user.pin_code = params['pin_code']
            user.save()
        else:
            user = Employee.objects.create(
                username=username,
                first_name=params['first_name'],
                last_name=params['last_name'],
                password=params['password'],
                pin_code=params['pin_code'],
            )

        for group_name in params['groups']:
            user.groups.add(Group.objects.get(name=group_name))

        for department_name in params['departments']:
            user.departments.add(Department.objects.get(name=department_name))

        user.current_department = Department.objects.get(name=params['departments'][0])
