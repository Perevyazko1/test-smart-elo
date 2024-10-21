from typing import Type

import django_filters
from django.db.models import QuerySet, Q

from staff.models import Employee


class EmployeeModelFilter(django_filters.FilterSet):
    find = django_filters.CharFilter(method='filter_find')
    departments = django_filters.CharFilter(lookup_expr='exact')
    piecework_wages = django_filters.BooleanFilter()
    permanent_department__id = django_filters.CharFilter(lookup_expr='exact')
    is_staff = django_filters.BooleanFilter()
    is_active = django_filters.BooleanFilter()
    user_departments_only = django_filters.CharFilter(method="filter_user_departments_only")

    class Meta:
        model = Employee
        fields = ['departments', 'is_staff', 'is_active', 'permanent_department__id', 'piecework_wages']

    def filter_user_departments_only(self, queryset: QuerySet[Type[Employee]], name, value):
        user: Employee | None = self.request.user
        if user:
            return queryset.filter(
                departments__in=user.departments.all()
            ).distinct()
        return queryset

    def filter_find(self, queryset: QuerySet[Type[Employee]], name, value):
        return queryset.filter(
            Q(first_name__icontains=value) |
            Q(last_name__icontains=value) |
            Q(patronymic__icontains=value) |
            Q(description__icontains=value)
        )