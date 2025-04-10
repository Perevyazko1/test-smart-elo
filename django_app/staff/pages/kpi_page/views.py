from django.db.models import QuerySet
from django.http import JsonResponse
from rest_framework.decorators import api_view

from core.models import Assignment, OrderProduct
from ...models import Department


@api_view(['GET'])
def get_kpi_data(request):
    date_from = request.query_params.get('date_from')
    date_to = request.query_params.get('date_to')

    print("**************",date_from, date_to)

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


    return JsonResponse({
        'date_from': date_from,
        'date_to': date_to,
        'total_count': target_assignments.count(),
        'total_sum': int(total_sum),
    }, json_dumps_params={"ensure_ascii": False})
