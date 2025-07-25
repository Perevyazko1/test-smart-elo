from django.urls import path, include
from rest_framework import routers

from .views import (
    create_new_payroll,
    EarningViewSet,
    PayrollRowViewSet,
    PayrollViewSet,
    user_info,
    confirm_earnings,
    close_payroll_row,
    cash_info,
)

router = routers.DefaultRouter()
router.register(r'earnings', EarningViewSet)
router.register(r'payrolls_rows', PayrollRowViewSet)
router.register(r'payrolls', PayrollViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('create_new_payroll/', create_new_payroll),
    path('confirm_earnings/', confirm_earnings),
    path('close_payroll_row/', close_payroll_row),
    path('user_info/', user_info),
    path('cash_info/', cash_info),

]
