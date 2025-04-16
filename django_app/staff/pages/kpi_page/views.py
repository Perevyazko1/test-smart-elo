from django.db.models import Sum
from django.http import JsonResponse
from rest_framework.decorators import api_view

from core.models import Assignment, OrderProduct, AssignmentCoExecutor
from ...models import Department, Employee
from tasks.models import TaskExecutor, Task


@api_view(['GET'])
def get_kpi_data(request):
    date_from = request.query_params.get('date_from')
    date_to = request.query_params.get('date_to')
    department__id = request.query_params.get('department__id')

    if department__id:
        department = Department.objects.get(id=department__id)
    else:
        department = request.user.current_department

    target_assignments = Assignment.objects.filter(
        department=department,
        date_completion__date__gte=date_from,
        date_completion__date__lte=date_to,
    ).select_related(
        'order_product__product', 'order_product__order', 'department'
    )
    target_order_products = OrderProduct.objects.filter(
        assignments__in=target_assignments,
    ).distinct().order_by('order__project')

    total_sum = 0
    for order_product in target_order_products:
        assignments_count = target_assignments.filter(
            order_product=order_product,
        ).count()
        total_sum += order_product.price * assignments_count

    user_report = []

    total_count = target_assignments.count()

    total_amount = 0

    while target_assignments.exists():
        assignment = target_assignments.first()

        user = assignment.executor

        assignments = target_assignments.filter(
            executor=user,
        )
        co_executors = AssignmentCoExecutor.objects.filter(
            assignment__in=assignments,
        )
        assignments_price = assignments.aggregate(total_amount=Sum('order_product__price'))['total_amount'] or 0
        target_assignments = target_assignments.exclude(executor=user)

        tasks = Task.objects.filter(
            verified_at__date__gte=date_from,
            verified_at__date__lte=date_to,
        )
        task_executors = TaskExecutor.objects.filter(
            employee=user,
            amount__gt=0,
            task__in=tasks,
        )
        task_amount = task_executors.aggregate(total_amount=Sum('amount'))['total_amount'] or 0

        if user.piecework_wages:
            assignments_amount = assignments.aggregate(total_amount=Sum('amount'))['total_amount'] or 0
            co_executors_amount = co_executors.aggregate(total_amount=Sum('amount'))['total_amount'] or 0
            total_amount += assignments_amount + co_executors_amount + task_amount
        else:
            assignments_amount = 0
            co_executors_amount = 0

        user_report.append({
            'username': user.username,
            'name': f"{user.first_name} {user.last_name} {'' if user.piecework_wages else '(Оклад)'}",
            'count': assignments.count(),
            'co_executor_count': co_executors.count(),
            'assignments_price': assignments_price,
            'assignments_amount': assignments_amount,
            'co_executors_amount': co_executors_amount,
            'task_amount': task_amount,
        })

    return JsonResponse({
        'date_from': date_from,
        'date_to': date_to,
        'total_count': total_count,
        'total_sum': int(total_sum),
        'total_amount': int(total_amount),
        'user_report': user_report,
    }, json_dumps_params={"ensure_ascii": False})
