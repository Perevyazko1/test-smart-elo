from typing import Type

import django_filters
from django.db.models import QuerySet

from staff.models import Employee


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

        if not int_ids:
            return queryset.none()  # Возвращаем пустой queryset

        return queryset.filter(id__in=int_ids)
