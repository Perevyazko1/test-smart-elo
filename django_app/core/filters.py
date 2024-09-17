import django_filters

from core.models import ProductionStep, ProductionStepComment


class ProductionStepCommentModelFilter(django_filters.FilterSet):
    class Meta:
        model = ProductionStepComment
        fields = ['production_step']


class ProductionStepModelFilter(django_filters.FilterSet):
    product__name = django_filters.CharFilter(lookup_expr='icontains')

    class Meta:
        model = ProductionStep
        fields = ['product__name']
