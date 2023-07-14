from django.urls import path, include
from rest_framework import routers

from .views import AssignmentViewSet

router = routers.DefaultRouter()
router.register(r'assignments', AssignmentViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
