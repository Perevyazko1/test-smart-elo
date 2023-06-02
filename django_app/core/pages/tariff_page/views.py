from django.http import JsonResponse
from rest_framework import viewsets
from rest_framework.decorators import api_view

from core.models import ProductionStep, Order
from core.pages.tariff_page.services.update_product_tax import update_product_tax
from core.serializers import ProductionStepSerializer
from staff.models import Employee


@api_view(['GET'])
def get_tariff_page_filters(request):
    view_modes = [
        'Все тарификации',
        'Без тарификации',
        'Тарифицированные'
    ]

    return JsonResponse(
        {
            "view_modes": view_modes,
        },
        json_dumps_params={"ensure_ascii": False}
    )


class GetProductionSteps(viewsets.ModelViewSet):
    queryset = ProductionStep.objects.all()
    serializer_class = ProductionStepSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        view_mode = self.request.query_params.get('view_mode')
        product_name = self.request.query_params.get('product_name')
        department_number = self.request.query_params.get('department_number')
        pin_code = self.request.query_params.get('pin_code')

        user = Employee.objects.get(pin_code=pin_code)

        qs = qs.filter(
            department__piecework_wages=True,
            department__in=user.departments.all()
        ).distinct()

        if not product_name == '':
            qs = qs.filter(
                product__name__icontains=product_name
            ).distinct()

        if view_mode == 'Без тарификации':
            qs = qs.filter(
                production_step_tariff__isnull=True
            ).distinct()

        if view_mode == 'Тарифицированные':
            qs = qs.filter(
                production_step_tariff__isnull=False
            ).distinct()

        if not department_number == '0':
            qs = qs.filter(
                department__number=department_number
            ).distinct()

        return qs


@api_view(['POST'])
def set_production_step_tax(request):
    product_id = request.data.get('product_id')
    pin_code = request.data.get('pin_code')
    department_number = request.data.get('department_number')
    tariff = request.data.get('tariff')

    update_product_tax(
        product_id=product_id,
        pin_code=pin_code,
        department_number=department_number,
        tariff=tariff
    )

    return JsonResponse({"data": 'data'}, json_dumps_params={"ensure_ascii": False})
