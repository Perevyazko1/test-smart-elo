import django_filters
from django.db.models import Q

from staff.models import Employee, Transaction


class EmployeeModelFilter(django_filters.FilterSet):
    input_name = django_filters.CharFilter(method='filter_input_name')
    department__name = django_filters.CharFilter(method='filter_department_name')

    class Meta:
        model = Employee
        fields = ['input_name']

    def filter_input_name(self, queryset, name, value):
        return queryset.filter(
            Q(first_name__icontains=value) |
            Q(last_name__icontains=value) |
            Q(description__icontains=value)
        )

    def filter_department_name(self, queryset, name, value):
        return queryset.filter(
            departments__name=value
        )


class TransactionModelFilter(django_filters.FilterSet):
    employee = django_filters.NumberFilter(field_name='employee__id')
    add_date = django_filters.DateFilter(method='filter_by_add_date')

    class Meta:
        model = Transaction
        fields = ['employee', 'add_date']

    def filter_by_add_date(self, queryset, name, value):
        if value:
            return queryset.filter(add_date__date=value)
        return queryset

