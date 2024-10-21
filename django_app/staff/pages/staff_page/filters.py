from typing import Type

import django_filters
from django.db.models import QuerySet

from staff.models import Employee, Transaction


class StaffInfoModelFilter(django_filters.FilterSet):
    ids = django_filters.CharFilter(method='filter_ids')

    class Meta:
        model = Employee
        fields = ['id', 'ids']

    def filter_ids(self, queryset: QuerySet[Type[Employee]], name, value):
        if not value:
            return queryset.none()

        user_ids = value.split(',')
        int_ids = [int(user_id) for user_id in user_ids if user_id.isdigit()]
        print(f'###PRINT filter_ids #l=>21:', int_ids)

        if not int_ids:
            return queryset.none()  # Возвращаем пустой queryset

        return queryset.filter(id__in=int_ids)


class TransactionModelFilter(django_filters.FilterSet):
    employee = django_filters.NumberFilter(field_name='employee__id')

    start_date = django_filters.CharFilter(method='filter_start_date')
    end_date = django_filters.CharFilter(method='filter_end_date')

    has_inspector = django_filters.BooleanFilter(field_name='inspector', lookup_expr='isnull', exclude=True)

    class Meta:
        model = Transaction
        fields = ['employee', 'has_inspector']

    def filter_start_date(self, queryset: QuerySet[Type[Transaction]], name, value):
        by_target_date = not bool(self.request.query_params.get('by_target_date'))
        if by_target_date:
            return queryset.filter(
                target_date__date__gte=value
            )
        else:
            return queryset.filter(
                add_date__date__gte=value
            )

    def filter_end_date(self, queryset: QuerySet[Type[Transaction]], name, value):
        by_target_date = not bool(self.request.query_params.get('by_target_date'))
        if by_target_date:
            return queryset.filter(
                target_date__date__lte=value
            )
        else:
            return queryset.filter(
                add_date__date__lte=value
            )
