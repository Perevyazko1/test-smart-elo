import django_filters
from django.db.models import QuerySet, Q

from core.services.get_week_info import GetWeekInfo
from .models import Task


class TaskModelFilter(django_filters.FilterSet):
    status = django_filters.CharFilter(method="filter_status")
    view_mode = django_filters.CharFilter(method="filter_view_mode")
    sort_mode = django_filters.CharFilter(method="filter_sort_mode")
    users = django_filters.CharFilter(method="filter_users")
    departments = django_filters.CharFilter(method="filter_departments")

    class Meta:
        model = Task
        fields = ['status']

    def filter_status(self, queryset: QuerySet, name, value):
        if value == '1':
            return queryset.filter(
                status=value
            )
        if value == '2':
            return queryset.filter(status=value).filter(
                Q(executor=self.request.user) |
                Q(co_executors=self.request.user) |
                Q(created_by=self.request.user)
            )
        if value == '3':
            year = self.request.query_params.get("year")
            week = self.request.query_params.get("week")
            week_info = GetWeekInfo(week=week, year=year).execute()
            return queryset.filter(
                status=value,
                ready_at__gt=week_info.date_range[0],
                ready_at__lte=week_info.date_range[1],
            ).filter(
                Q(executor=self.request.user) |
                Q(co_executors=self.request.user) |
                Q(created_by=self.request.user)
            )
        if value == '4':
            return queryset.filter(
                status=value,
            )
        return queryset

    def filter_view_mode(self, queryset: QuerySet, name, value):
        if value == '1':
            return queryset.filter(
                view_mode='1'
            ).exclude(
                status='4',
            )
        if value == '2':
            return queryset.filter(
                view_mode='2',
                for_department__in=self.request.user.departments.all()
            ).exclude(
                status='4',
            )
        if value == '3':
            return queryset.filter(
                status='4',
            )
        if value == '4':
            return queryset.filter(
                executor=self.request.user,
            )
        if value == '5':
            return queryset.filter(
                co_executors=self.request.user,
            )
        if value == '6':
            return queryset.filter(
                appointed_by=self.request.user,
            )
        return queryset.exclude(
            status='4',
        )

    def filter_sort_mode(self, queryset: QuerySet, name: str, value: str):
        if value == '1':
            return queryset.order_by('-urgency')
        if value == '2':
            return queryset.order_by('-id')
        return queryset.order_by('deadline')

    def filter_users(self, queryset: QuerySet, name: str, value: str):
        if value:
            user_ids = value.split(',')
            int_ids = []
            for user_id in user_ids:
                if user_id.isdigit():
                    int_ids.append(int(user_id))
            return queryset.filter(
                Q(executor__id__in=int_ids) |
                Q(co_executors__in=int_ids) |
                Q(created_by__id__in=int_ids)
            )

        return queryset

    def filter_departments(self, queryset: QuerySet, name: str, value: str):
        if value:
            department_ids = value.split(',')
            int_ids = []
            for department_id in department_ids:
                if department_id.isdigit():
                    int_ids.append(int(department_id))
            return queryset.filter(
                Q(for_departments__in=int_ids)
            )

        return queryset

