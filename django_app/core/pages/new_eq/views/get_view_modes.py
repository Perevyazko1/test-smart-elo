from staff.models import Employee


def get_view_modes(department_number):
    result = [
        {'name': 'Личные наряды', 'key': 'self'},
        {'name': 'Режим бригадира', 'key': 'boss'},
        {'name': 'Режим недоделки', 'key': 'unfinished'},
    ]

    users = Employee.objects.filter(departments__number=department_number).exclude(
        is_staff=True,
    )

    for user in users:
        result.append({'name': f'{user.first_name} {user.last_name}', 'key': str(user.id)})

    return result
