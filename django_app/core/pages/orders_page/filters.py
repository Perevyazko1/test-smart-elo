"""Filters for orders page. """
import django_filters

from core.models import Order


class OrderModelFilter(django_filters.FilterSet):
    """Order qs filter. """
    number = django_filters.CharFilter(lookup_expr='icontains')
    project = django_filters.CharFilter(lookup_expr='exact')
    status = django_filters.CharFilter(lookup_expr='icontains')

    class Meta:
        """Model metadata. """
        model = Order
        fields = ['number', 'project', 'status']
