from django.urls import path, include
from .views import import_orders, get_project_filters, get_op_dep_info, get_op_prod_info, get_tech_processes, \
    set_tech_process


urlpatterns = [
    path('import_orders/', import_orders),

    path('get_project_filters/', get_project_filters),
    path('get_op_dep_info/', get_op_dep_info),
    path('get_op_prod_info/', get_op_prod_info),
    path('get_tech_processes/', get_tech_processes),
    path('set_tech_process/', set_tech_process),

    path('', include('core.pages.new_eq.urls')),
    path('', include('core.pages.assignments_page.urls')),
    path('', include('core.pages.products_page.urls')),
    path('', include('core.pages.new_tariff_page.urls')),
]
