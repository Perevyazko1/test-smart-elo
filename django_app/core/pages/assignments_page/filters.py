import django_filters

from core.models import Assignment


class AssignmentModelFilter(django_filters.FilterSet):
    order_product__series_id = django_filters.CharFilter(lookup_expr='icontains')
    department__name = django_filters.CharFilter(lookup_expr='icontains')

    class Meta:
        model = Assignment
        fields = ['number', 'status', 'order_product__series_id', 'department__name']
