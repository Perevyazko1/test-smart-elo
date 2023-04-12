from staff.models import Department

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
}


def init_departments():
    for department_name, department_params in departments.items():
        Department.objects.update_or_create(
            name=department_name,
            number=department_params[0],
            defaults={
                "single": department_params[1],
                "piecework_wages": department_params[2]
            }
        )
