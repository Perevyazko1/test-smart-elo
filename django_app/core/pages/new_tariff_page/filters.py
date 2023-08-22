import django_filters
from django.db import models
from core.models import ProductionStep, Product


class ProductionStepModelFilter(django_filters.FilterSet):
    product__name = django_filters.CharFilter(lookup_expr='icontains')
    department__name = django_filters.CharFilter(lookup_expr='icontains')
    project = django_filters.CharFilter(method="filter_by_project")
    tariff_status = django_filters.CharFilter(method="filter_by_tariff_status")

    class Meta:
        model = ProductionStep
        fields = ['product__name', 'department__name', 'project', 'tariff_status']

    def filter_by_project(self, queryset, name, value):
        # Получите все продукты, связанные с заказами конкретного проекта
        products_for_project = Product.objects.filter(
            order_products__order__project=value,
        )

        # Фильтруйте ProductionStep на основе полученных продуктов
        return queryset.filter(product__in=products_for_project)

    def filter_by_tariff_status(self, queryset, name, value):
        if value == "proposed":
            return queryset.filter(production_step_tariff__tariff__lt=models.F('production_step_tariff__proposed_tariff'))

        elif value == "non_tariff":
            return queryset.filter(production_step_tariff__approved_by__isnull=True)

        elif value == "with_tariff":
            return queryset.filter(production_step_tariff__approved_by__isnull=False)

        return queryset
