from staff.models import Employee, Department


def get_view_modes(department: Department, user: Employee):
    result = [
        {'name': 'Мои наряды', 'key': 'self'},
        {'name': 'Распределение', 'key': 'distribute'},
        {'name': 'Режим бригадира', 'key': 'boss'},
        {'name': 'Режим недоделки', 'key': 'unfinished'},
    ]

    users = Employee.objects.filter(
        departments=department,
        is_staff=False,
        is_active=True,
    ).exclude(id=user.id)

    for user in users:
        result.append(
            {'name': f'{user.last_name} {user.first_name} '
                     f'('
                     f'{user.last_name[0] if user.last_name else ""}'
                     f'{user.first_name[0] if user.first_name else ""}'
                     f'{user.patronymic[0] if user.patronymic else ""}'
                     f')',
             'key': str(user.id)
             }
        )

    return result
