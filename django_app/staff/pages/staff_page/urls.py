from django.urls import path, include
from rest_framework import routers

from .views import StaffInfoViewSet, get_assignment_counts

router = routers.DefaultRouter()
router.register(r'staff_info', StaffInfoViewSet)

urlpatterns = [
    path('', include(router.urls)),

    path('get_assignment_counts/', get_assignment_counts),
]
