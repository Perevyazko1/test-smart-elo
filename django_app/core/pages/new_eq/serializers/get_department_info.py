from core.models import Assignment
from staff.models import Employee


def get_eq_card_department_info(order_product, department_number):
    employees = Employee.objects.filter(
        departments__number=department_number,
    ).exclude(
        username='root',
    )
    results = []
    for employee in employees:
        data = {
            "count_in_work": Assignment.objects.filter(
                executor=employee,
                order_product=order_product,
                status='in_work'
            ).count(),
            'full_name': f'{employee.first_name} {employee.last_name}'
        }
        results.append(data)
    return results
