from rest_framework import routers
from django.urls import path, include

from .views import StaffInfoViewSet, TransactionViewSet, get_assignment_counts, confirm_transactions

router = routers.DefaultRouter()
router.register(r'staff_info', StaffInfoViewSet)
router.register(r'transactions', TransactionViewSet)

urlpatterns = [
    path('', include(router.urls)),

    path('get_assignment_counts/', get_assignment_counts),
    path('confirm_transactions/', confirm_transactions),
]
