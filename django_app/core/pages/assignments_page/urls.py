from django.urls import path, include
from rest_framework import routers

from .views import AssignmentViewSet, update_co_executor

router = routers.DefaultRouter()

router.register(r'assignments', AssignmentViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('update_co_executor/', update_co_executor),
]
