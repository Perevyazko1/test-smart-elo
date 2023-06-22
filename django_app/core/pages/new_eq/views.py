from rest_framework import viewsets

from core.models import OrderProduct
from core.pages.new_eq.serializers import EqCardSerializer


class GetEqCards(viewsets.ModelViewSet):
    queryset = OrderProduct.objects.all()
    serializer_class = EqCardSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['department_number'] = self.request.query_params.get('department_number')
        return context

    def get_queryset(self):
        qs = super().get_queryset()
        return qs
