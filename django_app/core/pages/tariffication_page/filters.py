"""Filters for tariffication page. """
import django_filters
from django.db import models
from core.models import ProductionStep, Product


class TarifficationPageListFilter(django_filters.FilterSet):
    """Filter for tariffication page list. """
    product__name = django_filters.CharFilter(lookup_expr='icontains')
    department__name = django_filters.CharFilter(lookup_expr='icontains')
    project = django_filters.CharFilter(method="filter_by_project")
    tariff_status = django_filters.CharFilter(method="filter_by_tariff_status")

    class Meta:
        """Metadata. """
        model = ProductionStep
        fields = ['product__name', 'department__name', 'project', 'tariff_status']

    def filter_by_project(self, queryset, name, value):
        """Filter list by project. """
        products_for_project = Product.objects.filter(
            order_products__order__project=value,
        )

        # Фильтруйте ProductionStep на основе полученных продуктов
        return queryset.filter(product__in=products_for_project)

    def filter_by_tariff_status(self, queryset, name, value):
        """Filter list by status. """
        if value == "proposed":
            return queryset.filter(
                proposed_tariff__isnull=False
            ).exclude(
                confirmed_tariff__amount=models.F('proposed_tariff__amount')
            )

        elif value == "non_tariff":
            return queryset.filter(confirmed_tariff__isnull=True)

        elif value == "with_tariff":
            return queryset.filter(confirmed_tariff__isnull=False)

        return queryset
