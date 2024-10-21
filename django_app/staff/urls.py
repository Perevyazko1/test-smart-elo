from django.urls import include, path
from rest_framework import routers

from .views import *

router = routers.DefaultRouter()
router.register(r'employees', EmployeeViewSet)
router.register(r'update_create_user', CreateUserViewSet, basename='update_create_user')
router.register(r'departments', DepartmentViewSet)


urlpatterns = [
    path('', include(router.urls)),

    path('info/', include('staff.pages.staff_page.urls')),
    path('tasks/', include('staff.pages.tasks_widget.urls')),

    path('pin_code_authentication/', pin_code_authentication),
    path('base_authentication/', base_authentication),
    path('change_current_department/', change_current_department),
    path('get_audit_list/', get_audit_list),
    path('add_to_favorite/', add_to_favorite),
]
