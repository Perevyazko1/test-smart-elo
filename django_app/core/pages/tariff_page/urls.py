from django.urls import path

from core.pages.tariff_page.views import get_production_step_list, set_production_step_tax, get_tariff_page_filters

urlpatterns = [
    path('get_production_step_list/', get_production_step_list),
    path('set_production_step_tax/', set_production_step_tax),
    path('get_tariff_page_filters/', get_tariff_page_filters),
]
