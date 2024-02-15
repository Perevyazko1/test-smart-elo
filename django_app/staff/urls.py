from django.urls import include, path
from rest_framework import routers

from .pages.wages_pages.views import TransactionViewSet
from .views import *

router = routers.DefaultRouter()
router.register(r'employees', EmployeeViewSet)
router.register(r'departments', DepartmentViewSet)
router.register(r'transactions', TransactionViewSet)


urlpatterns = [
    path('', include(router.urls)),
    path('', include('staff.pages.wages_pages.urls')),
    path('pin_code_authentication/', pin_code_authentication),
    path('base_authentication/', base_authentication),
    path('change_current_department/', change_current_department),
    path('get_audit_list/', get_audit_list),
]
