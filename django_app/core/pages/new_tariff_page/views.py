from rest_framework import viewsets

from core.models import ProductionStep, ProductionStepTariff
from core.pages.new_tariff_page.filters import ProductionStepModelFilter
from core.pages.new_tariff_page.serializers import TariffPageSerializer, TariffSerializer
from staff.models import Employee


class TariffPageViewSet(viewsets.ModelViewSet):
    queryset = ProductionStep.objects.all()
    serializer_class = TariffPageSerializer
    filterset_class = ProductionStepModelFilter

    def get_queryset(self):
        qs = super().get_queryset()
        pin_code = self.request.query_params.get('pin_code')

        user = Employee.objects.get(pin_code=pin_code)

        qs = qs.filter(
            department__in=user.departments.all(),
            department__piecework_wages=True,
        )

        return qs.order_by('product')


class TariffViewSet(viewsets.ModelViewSet):
    queryset = ProductionStepTariff.objects.all()
    serializer_class = TariffSerializer

    def create(self, request, *args, **kwargs):
        pin_code = self.request.query_params.get('pin_code')
        return super().create(request, *args, **kwargs)


# class RetarifficationViewSet(viewsets.ModelViewSet):
#     queryset = Assignment.objects.all()
#     serializer_class = TariffPageSerializer
#     filterset_class = ProductionStepModelFilter
#
#     def get_queryset(self):
#         qs = super().get_queryset()
#         pin_code = self.request.query_params.get('pin_code')
#
#         user = Employee.objects.get(pin_code=pin_code)
#
#         qs = qs.filter(
#             department__in=user.departments.all(),
#             department__piecework_wages=True,
#         )
#
#         return qs.order_by('product')
