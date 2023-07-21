import django_filters

from core.models import Product


class ProductModelFilter(django_filters.FilterSet):
    name = django_filters.CharFilter(lookup_expr='icontains')

    class Meta:
        model = Product
        fields = ['name']
