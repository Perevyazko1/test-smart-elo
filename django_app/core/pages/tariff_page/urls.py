from django.urls import path, include
from rest_framework import routers

from core.pages.tariff_page.views import GetProductionSteps, set_production_step_tax, get_tariff_page_filters

router = routers.DefaultRouter()
router.register(r'get_production_steps', GetProductionSteps)


urlpatterns = [
    path('set_production_step_tax/', set_production_step_tax),
    path('get_tariff_page_filters/', get_tariff_page_filters),

    path('', include(router.urls)),

]
