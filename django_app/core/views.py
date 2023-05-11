from django.http import JsonResponse
from django.shortcuts import redirect
from rest_framework.decorators import api_view

from .models import Order


def import_orders(request):
    """Импорт заказов из МойСклад"""
    from .api_moy_sklad.services.import_orders import ImportOrders
    ImportOrders().execute()

    return redirect(request.META.get('HTTP_REFERER'))


@api_view(['GET'])
def get_project_filters(request):
    result = ['Все проекты']
    projects = list(Order.objects.all().distinct('project').values_list('project', flat=True))

    result += projects

    return JsonResponse({"data": result}, json_dumps_params={"ensure_ascii": False})
