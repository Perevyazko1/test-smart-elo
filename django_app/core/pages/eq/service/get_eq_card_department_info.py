"""Get EQ card department info. """

from django.db.models import Count, Q

from core.models import Assignment


def get_eq_card_department_info(order_product, department):
    # Получаем наряды для всех сотрудников, принадлежащих к указанному отделу и связанным с конкретным order_product
    assignments = Assignment.objects.filter(
        order_product=order_product,
        department=department,
        executor__departments=department,
    ).values(
        'executor_id',
        'executor__last_name',
        'executor__first_name',
        'executor__patronymic',
    ).annotate(
        count_all=Count('id'),
        count_in_work=Count('id', filter=Q(status='in_work'))
    )

    results = []
    for assignment in assignments:
        # Формируем данные для каждого сотрудника
        last_name = assignment['executor__last_name'][0] if assignment['executor__last_name'] else ""
        first_name = assignment['executor__first_name'][0] if assignment['executor__first_name'] else ""
        patronymic = assignment['executor__patronymic'][0] if assignment['executor__patronymic'] else ""

        data = {
            "count_in_work": assignment['count_in_work'],
            "count_all": assignment['count_all'],
            'full_name': f'{last_name}{first_name}{patronymic}'
        }
        results.append(data)

    return results
