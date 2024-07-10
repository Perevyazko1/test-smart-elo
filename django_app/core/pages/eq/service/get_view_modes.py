from staff.models import Employee, Department


def get_view_modes(department: Department):
    result = [
        {'name': 'Личные наряды', 'key': 'self'},
        {'name': 'Режим бригадира', 'key': 'boss'},
        {'name': 'Режим недоделки', 'key': 'unfinished'},
    ]

    users = Employee.objects.filter(departments=department).exclude(
        is_staff=True,
        is_active=False,
    )

    for user in users:
        result.append({'name': f'{user.first_name} {user.last_name}', 'key': str(user.id)})

    return result
