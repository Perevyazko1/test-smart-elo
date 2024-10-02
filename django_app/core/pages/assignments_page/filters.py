import django_filters

from core.models import Assignment


class AssignmentModelFilter(django_filters.FilterSet):
    order_product__series_id = django_filters.CharFilter(lookup_expr='icontains')
    order_product__product__id = django_filters.CharFilter(lookup_expr='exact')
    order_product__order__project = django_filters.CharFilter(lookup_expr='exact')
    department__id = django_filters.CharFilter(lookup_expr='exact')
    status = django_filters.CharFilter(lookup_expr='exact')
    executor = django_filters.CharFilter(lookup_expr='exact')
    inspector = django_filters.CharFilter(lookup_expr='exact')

    class Meta:
        model = Assignment
        fields = [
            'order_product__series_id',
            'order_product__product__id',
            'order_product__order__project',
            'department__id',
            'status',
            'executor',
            'inspector',
        ]
