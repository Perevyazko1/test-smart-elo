import django_filters
from django.db.models import QuerySet, Q

from core.services.get_week_info import GetDateRangeInfo
from .models import Task, TaskComment


class TaskCommentModelFilter(django_filters.FilterSet):
    class Meta:
        model = TaskComment
        fields = ['task']


class TaskModelFilter(django_filters.FilterSet):
    status = django_filters.CharFilter(method="filter_status")
    view_mode = django_filters.CharFilter(method="filter_view_mode")
    sort_mode = django_filters.CharFilter(method="filter_sort_mode")
    users = django_filters.CharFilter(method="filter_users")
    exclude_users = django_filters.CharFilter(method="filter_exclude_users")
    user = django_filters.CharFilter(method="filter_user")
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
            return queryset.filter(status=value)

        if value == '3':
            start_date = self.request.query_params.get("start_date")
            end_date = self.request.query_params.get("end_date")

            date_info = GetDateRangeInfo(start_date_str=start_date, end_date_str=end_date).get_range_info()
            current_date_info = GetDateRangeInfo().get_range_info()

            if date_info['date_range']['start_date'] == current_date_info['date_range']['start_date']\
                    and date_info['date_range']['end_date'] == current_date_info['date_range']['end_date']:
                return queryset.filter(
                    Q(
                        status=value,
                        verified_at__gte=date_info['date_range']['start_date'],
                        verified_at__lte=date_info['date_range']['end_date'],
                    ) |
                    Q(
                        status=value,
                        verified_at__isnull=True,
                    )
                )
            else:
                return queryset.filter(
                    status=value,
                    verified_at__gte=date_info['date_range']['start_date'],
                    verified_at__lte=date_info['date_range']['end_date'],
                )

        if value == '4':
            start_date = self.request.query_params.get("start_date")
            end_date = self.request.query_params.get("end_date")

            date_info = GetDateRangeInfo(start_date_str=start_date, end_date_str=end_date).get_range_info()

            return queryset.filter(
                status=value,
                ready_at__gte=date_info['date_range']['start_date'],
                ready_at__lte=date_info['date_range']['end_date'],
            )
        return queryset

    def filter_view_mode(self, queryset: QuerySet, name, value):
        # Режим только мне - убираем отмененные и оставляем задачи в режиме Только мне
        if value == '1':
            return queryset.filter(
                view_mode='1'
            ).exclude(
                status='4',
            )
        # Режим в моих отделах - убираем отмененные и фильтруем по отделу пользователя
        if value == '2':
            return queryset.filter(
                view_mode='2',
                for_department__in=self.request.user.departments.all()
            ).exclude(
                status='4',
            )
        # Режим отмененные - оставляет только соответствующий кверисет
        if value == '3':
            return queryset.filter(
                status='4',
            )
        # Режим я исполнитель - фильтруем по пользователю в поле исполнитель
        if value == '4':
            return queryset.filter(
                new_executor__employee=self.request.user,
            )

        # Режим я соисполнитель - фильтруем по пользователю в поле соисполнители
        if value == '5':
            return queryset.filter(
                new_co_executors__employee=self.request.user,
            )
        # Режим назначенные мной
        if value == '6':
            return queryset.filter(
                appointed_by=self.request.user,
            )
        # Режим ожидающих визы на тариф
        if value == '7':
            return queryset.filter(
                proposed_tariff__isnull=False,
                confirmed_tariff__isnull=True,
            )
        # Режим с утвержденной сделкой
        if value == '8':
            return queryset.filter(
                confirmed_tariff__isnull=False,
            )
        # Режим завизированных со сделкой (из ЭЛО)
        if value == '9':
            return queryset.filter(
                confirmed_tariff__isnull=False,
                status='3',
                verified_at__isnull=False,
            ).exclude(
                status='4',
            )
        # По умолчанию просто не фильтруем
        return queryset

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

            extended_search = self.request.query_params.get("extended_search")

            if extended_search:
                return queryset.filter(
                    Q(new_executor__employee__id__in=int_ids) |
                    Q(new_co_executors__employee__in=int_ids) |
                    Q(created_by__id__in=int_ids)
                )
            else:
                return queryset.filter(
                    new_executor__employee__id__in=int_ids
                )
        return queryset

    def filter_exclude_users(self, queryset: QuerySet, name: str, value: str):
        if value:
            user_ids = value.split(',')
            int_ids = []
            for user_id in user_ids:
                if user_id.isdigit():
                    int_ids.append(int(user_id))

            extended_search = self.request.query_params.get("extended_search")
            if extended_search:
                return queryset.exclude(
                    Q(new_executor__employee__id__in=int_ids) |
                    Q(new_co_executors__employee__in=int_ids) |
                    Q(created_by__id__in=int_ids)
                )
            else:
                return queryset.exclude(
                    new_executor__employee__id__in=int_ids
                )
        return queryset

    def filter_user(self, queryset: QuerySet, name: str, value: str):
        if value:
            if value.isdigit():
                return queryset.filter(
                    Q(new_executor__employee__id=value) |
                    Q(new_co_executors__employee__id=value)
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
