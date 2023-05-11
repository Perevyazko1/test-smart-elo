from django.urls import path, include

from .views import import_orders, get_project_filters

urlpatterns = [
    path('import_orders/', import_orders),

    path('get_project_filters/', get_project_filters),

    path('', include('core.pages.eq_page.urls')),
    path('', include('core.pages.tariff_page.urls')),
]
