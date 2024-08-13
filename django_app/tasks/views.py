from dataclasses import asdict
from datetime import datetime

from django.utils import timezone
from django.db.models import Q
from django.http import JsonResponse
from django.shortcuts import get_object_or_404

from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response

from core.consumers import ws_send_to_all, ws_send_to_department
from core.services.get_week_info import GetWeekInfo
from .filters import TaskModelFilter, TaskCommentModelFilter
from .models import Task, TaskImage, TaskComment, TaskViewInfo
from .serializers import TaskReadSerializer, TaskWriteSerializer, TaskImageSerializer, TaskCommentSerializer, \
    TaskViewInfoSerializer


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    filterset_class = TaskModelFilter

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['user'] = self.request.user
        return context

    def get_queryset(self):
        queryset = super().get_queryset()
        return queryset.filter(
            Q(view_mode='1', created_by=self.request.user) |
            Q(view_mode='2', created_by=self.request.user) |
            Q(view_mode='2', for_department__in=self.request.user.departments.all()) |
            Q(view_mode='2', for_department__isnull=True) |
            Q(view_mode='3') |
            Q(view_mode='4', created_by=self.request.user) |
            Q(view_mode='4', executor=self.request.user) |
            Q(view_mode='4', co_executors=self.request.user)
        ).distinct()

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
        if (instance.executor
                and not instance.executor == instance.created_by
                and not instance.executor == self.request.user):
            ws_send_to_department(
                instance.executor.current_department.number,
                {
                    'action': 'NEW_NOTIFICATION',
                    'title': "ЭЛО - Имеются новые задачи",
                    'body': instance.title,
                    'for_user': instance.executor.pin_code,
                    'tag': f'task{instance.id}',
                    'url': f'/task?'
                           f'await_scroll_to={instance.id}&'
                           f'in_work_scroll_to={instance.id}&'
                           f'ready_scroll_to={instance.id}'
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


class TaskImageViewSet(viewsets.ModelViewSet):
    queryset = TaskImage.objects.all()
    serializer_class = TaskImageSerializer

    def perform_destroy(self, instance: TaskImage):
        instance_task_id = instance.task.id
        super().perform_destroy(instance)
        self.after_delete(instance_task_id)

    def after_delete(self, task_id: int):
        ws_send_to_all(
            {
                'action': 'UPDATE_TASK',
                'data': task_id
            }
        )


class TaskCommentViewSet(viewsets.ModelViewSet):
    queryset = TaskComment.objects.all()
    filterset_class = TaskCommentModelFilter
    serializer_class = TaskCommentSerializer


class TaskViewInfoViewSet(viewsets.ModelViewSet):
    queryset = TaskViewInfo.objects.all()
    serializer_class = TaskViewInfoSerializer

    @action(detail=False, methods=['post'], url_path='update_view')
    def update_view_date(self, request):
        employee_id = request.data.get('employee_id')
        task_id = request.data.get('task_id')

        if not employee_id or not task_id:
            return Response({"detail": "Invalid data."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            TaskViewInfo.objects.update_or_create(
                employee_id=employee_id,
                task_id=task_id,
            )
            return Response(
                {"detail": "Task view date updated successfully."},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Переопределяем метод list для фильтрации по task_id
    def get_queryset(self):
        queryset = super().get_queryset()
        task_id = self.request.query_params.get('task_id')

        if task_id:
            queryset = queryset.filter(task_id=task_id)

        return queryset
