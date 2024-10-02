import django_filters

from staff.models import Employee


class EmployeeModelFilter(django_filters.FilterSet):
    departments = django_filters.CharFilter(lookup_expr='exact')
    is_staff = django_filters.BooleanFilter()
    is_active = django_filters.BooleanFilter()

    class Meta:
        model = Employee
        fields = ['departments', 'is_staff', 'is_active']
