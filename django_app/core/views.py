from django.http import JsonResponse
from django.shortcuts import redirect
from rest_framework.decorators import api_view

from .models import Order, OrderProduct


def import_orders(request):
    """Импорт заказов из МойСклад"""
    from .api_moy_sklad.services.import_orders import ImportOrders
    ImportOrders().execute()

    return redirect(request.META.get('HTTP_REFERER'))


@api_view(['GET'])
def get_project_filters(request):
    mode = request.query_params.get('mode')

    if mode == 'all':
        projects = list(Order.objects.all().distinct('project').values_list('project', flat=True))
    else:
        projects = list(
            Order.objects
            .filter(order_products__status=0)
            .distinct('project')
            .values_list('project', flat=True)
        )

    result = ['Все проекты']

    result += projects

    return JsonResponse({"data": result}, json_dumps_params={"ensure_ascii": False})
