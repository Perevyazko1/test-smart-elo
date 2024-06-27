from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet, get_week_data, TaskImageViewSet


router = DefaultRouter()
router.register(r'tasks', TaskViewSet)
router.register(r'task_images', TaskImageViewSet)


urlpatterns = [
    path('', include(router.urls)),
    path('get_week_data/', get_week_data),
]
