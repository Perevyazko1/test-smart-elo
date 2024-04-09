import django_filters

from core.models import Assignment


class AssignmentModelFilter(django_filters.FilterSet):
    order_product__series_id = django_filters.CharFilter(lookup_expr='icontains')
    department__id = django_filters.CharFilter(lookup_expr='exact')

    class Meta:
        model = Assignment
        fields = ['order_product__series_id', 'department__id']
