import django_filters
from django.db.models import QuerySet

from core.models import Product


class ProductModelFilter(django_filters.FilterSet):
    name = django_filters.CharFilter(lookup_expr='icontains')
    project = django_filters.CharFilter(method="filter_project")

    class Meta:
        model = Product
        fields = ['name']

    def filter_project(self, queryset: QuerySet, name, value):
        return queryset.filter(
            order_products__order__project=value
        )
