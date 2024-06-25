from dataclasses import asdict

from django.db.models import Q
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from core.consumers import ws_send_to_all
from core.services.get_week_info import GetWeekInfo
from .filters import TaskModelFilter
from .models import Task
from .serializers import TaskReadSerializer, TaskWriteSerializer


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    filterset_class = TaskModelFilter

    def get_queryset(self):
        queryset = super().get_queryset()
        return queryset.filter(
            Q(view_mode='1', appointed_by=self.request.user) |
            Q(view_mode='2', appointed_by=self.request.user) |
            Q(view_mode='2', for_department__in=self.request.user.departments.all()) |
            Q(view_mode='2', for_department__isnull=True) |
            Q(view_mode='3') |
            Q(view_mode='4', appointed_by=self.request.user) |
            Q(view_mode='4', executor=self.request.user) |
            Q(view_mode='4', co_executors=self.request.user)
        )

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return TaskReadSerializer
        return TaskWriteSerializer

    def partial_update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        read_serializer = TaskReadSerializer(instance)

        if getattr(instance, '_prefetched_objects_cache', None):
            # If 'prefetch_related' has been applied to a queryset, we need to forcibly
            # invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}

        return Response(read_serializer.data, status=status.HTTP_200_OK)

    def perform_create(self, serializer):
        super().perform_create(serializer)
        self.after_save(serializer.instance)

    def perform_update(self, serializer):
        super().perform_update(serializer)
        self.after_save(serializer.instance)

    def after_save(self, instance: Task):
        update_mode = self.request.query_params.get("update_mode")
        if update_mode == 'all':
            ws_send_to_all(
                {
                    'action': 'UPDATE_TASK',
                    'data': instance.id
                }
            )
        else:
            ws_send_to_all(
                {
                    'action': 'UPDATE_TASK',
                    'data': instance.id,
                    'exclude': self.request.user.pin_code,
                }
            )

    def retrieve(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        obj = get_object_or_404(queryset, pk=kwargs.get('pk'))
        serializer = self.get_serializer(obj)
        return Response(serializer.data)


@api_view(['GET'])
def get_week_data(request):
    week = request.query_params.get("week")
    year = request.query_params.get("year")

    week_info = GetWeekInfo(week=week, year=year).execute()

    return JsonResponse(asdict(week_info), json_dumps_params={"ensure_ascii": False})
