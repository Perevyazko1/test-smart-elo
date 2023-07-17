from django.urls import path, include
from rest_framework import routers

from .views import AssignmentViewSet, update_assignments

router = routers.DefaultRouter()
router.register(r'assignments', AssignmentViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('update_assignments/', update_assignments),
]
