from django.db.models import QuerySet, Sum
from django.http import JsonResponse
from rest_framework.decorators import api_view

from core.models import Assignment, OrderProduct, AssignmentCoExecutor
from ...models import Department


@api_view(['GET'])
def get_kpi_data(request):
    date_from = request.query_params.get('date_from')
    date_to = request.query_params.get('date_to')

    print("**************", date_from, date_to)

    obivka: Department = Department.objects.get(number=2)

    target_assignments = Assignment.objects.filter(
        department=obivka,
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
        user_report.append({
            'username': user.username,
            'name': f"{user.first_name} {user.last_name}",
            'count': assignments.count(),
            'co_executor_count': co_executors.count(),
            'assignments_price': assignments_price,
        })

    return JsonResponse({
        'date_from': date_from,
        'date_to': date_to,
        'total_count': total_count,
        'total_sum': int(total_sum),
        'user_report': user_report,
    }, json_dumps_params={"ensure_ascii": False})
