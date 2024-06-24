from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet, get_week_data


router = DefaultRouter()
router.register(r'tasks', TaskViewSet)


urlpatterns = [
    path('', include(router.urls)),
    path('get_week_data/', get_week_data),
]
