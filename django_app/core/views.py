from django.shortcuts import redirect
from rest_framework import viewsets

from .api_moy_sklad.services.import_orders import ImportOrders
from .eq_serializers.eq_card_serializers import EQCardSerializer
from .serializers import *


def import_orders(request):
    # TODO Добавить импорт заказов
    ImportOrders().execute()
    return redirect(request.META.get('HTTP_REFERER'))


# @query_debugger
class EQCardViewSet(viewsets.ModelViewSet):
    queryset = OrderProduct.objects.all()
    serializer_class = EQCardSerializer

    def get_serializer_context(self):
        """Переопределяем стандартный контекст сериалайзера"""
        context = super().get_serializer_context()

        """Прокидываем в контекст целевые статусы и номер отдела"""
        context['status_list'] = self._get_status_list()
        context['department_number'] = self.request.query_params.get('department_number')

        return context

    def get_queryset(self):
        """Переопределяем стандартный кверисет под полученные параметры"""
        qs = super().get_queryset()

        """Производим фильтрацию в зависимости от полученных параметров"""
        if self._get_status_list():
            qs = qs.filter(
                assignments__status__in=self._get_status_list(),
            )
        if self.request.query_params.get('department_number'):
            qs = qs.filter(
                assignments__department__number=self.request.query_params.get('department_number')
            )
        return qs

    def _get_status_list(self) -> list[str]:
        status_param: str = self.request.query_params.get('status_list')
        if status_param:
            return list(status_param.split(','))
        return []


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer


class ProductPictureViewSet(viewsets.ModelViewSet):
    queryset = ProductPicture.objects.all()
    serializer_class = ProductPictureSerializer


class FabricViewSet(viewsets.ModelViewSet):
    queryset = Fabric.objects.all()
    serializer_class = FabricSerializer


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer


class OrderProductViewSet(viewsets.ModelViewSet):
    queryset = OrderProduct.objects.all()
    serializer_class = OrderProductSerializer


class AssignmentViewSet(viewsets.ModelViewSet):
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer


class ProductionStepViewSet(viewsets.ModelViewSet):
    queryset = ProductionStep.objects.all()
    serializer_class = ProductionStepSerializer


class TechnologicalProcessViewSet(viewsets.ModelViewSet):
    queryset = TechnologicalProcess.objects.all()
    serializer_class = TechnologicalProcessSerializer
