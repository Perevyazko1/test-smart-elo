from django.urls import path, include
from rest_framework import routers

from .views import *


router = routers.DefaultRouter()
router.register(r'get_await_list', GetAwaitList)
router.register(r'get_in_work_list', GetInWorkList)
router.register(r'get_ready_list', GetReadyList)


urlpatterns = [
    path('import_orders/', import_orders),
    path('update_assignments/', update_assignments),
    path('get_week_info/', get_week_info),
    path('get_project_filters/', get_project_filters),
    path('get_view_modes/', get_view_modes),
    path('', include(router.urls)),
]
