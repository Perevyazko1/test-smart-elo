from django.urls import path, include
from rest_framework import routers

from core.pages.eq_page.views import GetAwaitList, GetInWorkList, GetReadyList, update_assignments, get_week_info, \
    get_view_modes, get_tech_process_info, set_tech_process, get_order_product_info, set_custom_tech_process
from core.views import get_project_filters

router = routers.DefaultRouter()
router.register(r'get_await_list', GetAwaitList)
router.register(r'get_in_work_list', GetInWorkList)
router.register(r'get_ready_list', GetReadyList)


urlpatterns = [
    path('update_assignments/', update_assignments),

    # TODO переделать запрос фильтров в один
    path('get_week_info/', get_week_info),
    path('get_project_filters/', get_project_filters),
    path('get_view_modes/', get_view_modes),
    path('get_tech_process_info/', get_tech_process_info),
    path('get_order_product_info/', get_order_product_info),

    path('set_tech_process/', set_tech_process),
    path('set_custom_tech_process/', set_custom_tech_process),

    path('', include(router.urls)),
]
