import django_filters

from core.models import ProductionStep


class ProductionStepModelFilter(django_filters.FilterSet):
    product__name = django_filters.CharFilter(lookup_expr='icontains')

    class Meta:
        model = ProductionStep
        fields = ['product__name']
