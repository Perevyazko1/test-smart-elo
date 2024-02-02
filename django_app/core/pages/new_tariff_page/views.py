from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.filters import OrderingFilter
from rest_framework.response import Response

from core.models import ProductionStep, ProductionStepTariff, Assignment
from core.pages.new_tariff_page.filters import ProductionStepModelFilter
from core.pages.new_tariff_page.serializers import TariffPageSerializer, TariffSerializer, RetarifficationSerializer
from staff.models import Transaction


class TariffPageViewSet(viewsets.ModelViewSet):
    queryset = ProductionStep.objects.all()
    serializer_class = TariffPageSerializer
    filterset_class = ProductionStepModelFilter

    def get_queryset(self):
        qs = super().get_queryset()
        qs = qs.filter(
            department__in=self.request.user.departments.all(),
            department__piecework_wages=True,
        )

        return qs.order_by('product')


class TariffViewSet(viewsets.ModelViewSet):
    queryset = ProductionStepTariff.objects.all()
    serializer_class = TariffSerializer


class RetarifficationViewSet(viewsets.ModelViewSet):
    queryset = Assignment.objects.all()
    serializer_class = RetarifficationSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    ordering_fields = ['executor', 'inspect_date', 'date_completion']

    def get_queryset(self):
        qs = super().get_queryset()
        try:
            product__id = int(self.request.query_params.get('product__id'))
            department__number = int(self.request.query_params.get('department__number'))
        except TypeError:
            return Response({'error': 'Incorrect params'}, status=status.HTTP_404_NOT_FOUND)

        qs = qs.filter(
            order_product__product__id=int(product__id),
            department__number=int(department__number),
            tariff__isnull=True,
            inspector__isnull=False,
        )

        return qs


@api_view(['POST'])
def post_retariffication(request):
    ids = request.data.get('ids')
    if not ids:
        return Response({'error': 'ids field is required'}, status=status.HTTP_400_BAD_REQUEST)

    queryset = Assignment.objects.filter(id__in=ids)

    inspector = request.user

    for assignment in queryset:
        product = assignment.order_product.product
        department = assignment.department
        production_step = ProductionStep.objects.get(
            department=department,
            product=product,
        )
        assignment.tariff = production_step.production_step_tariff
        assignment.save()

        description = f'Производство полуфабриката {assignment} {assignment.department.name}'

        Transaction.objects.create(
            transaction_type='accrual',
            details='wages',
            amount=assignment.tariff.tariff,
            employee=assignment.executor,
            executor=inspector,
            inspector=inspector,
            description=description,
        )

    return Response({'status': 'success'}, status=status.HTTP_200_OK)
