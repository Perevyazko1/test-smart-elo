from rest_framework import routers
from django.urls import path, include

from staff.pages.wages_pages.views import WagesViewSet, get_wages_week_info, TransactionViewSet, get_assignment_counts

router = routers.DefaultRouter()
router.register(r'wages_list', WagesViewSet)
router.register(r'transactions', TransactionViewSet)


urlpatterns = [
    path('', include(router.urls)),
    path('get_wages_week_info/', get_wages_week_info),
    path('get_assignment_counts/', get_assignment_counts),
]
