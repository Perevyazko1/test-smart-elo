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
    start_date = django_filters.DateFilter(field_name='add_date__date', lookup_expr='gte')
    end_date = django_filters.DateFilter(field_name='add_date__date', lookup_expr='lte')

    class Meta:
        model = Transaction
        fields = ['employee', 'start_date', 'end_date']
