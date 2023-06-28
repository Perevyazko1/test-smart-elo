from rest_framework import viewsets

from core.models import OrderProduct
from core.pages.new_eq.serializers.serializers import EqCardSerializer
from core.pages.new_eq.services.get_eq_req_params import get_eq_req_params
from core.pages.new_eq.views.get_eq_card_queryset import get_eq_card_queryset
from core.pages.new_eq.views.get_target_list_name_from_req import get_target_list_name_from_req


class GetEqCards(viewsets.ModelViewSet):
    queryset = OrderProduct.objects.all()
    serializer_class = EqCardSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['eq_params'] = get_eq_req_params(request=self.request)
        context['target_list'] = get_target_list_name_from_req(request=self.request)
        return context

    def get_queryset(self):
        qs = super().get_queryset()
        print(get_eq_req_params(self.request))
        qs = get_eq_card_queryset(queryset=qs, request=self.request)
        return qs
