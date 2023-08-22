from rest_framework import routers
from django.urls import path, include

from core.pages.new_tariff_page.views import TariffPageViewSet, TariffViewSet

router = routers.DefaultRouter()
router.register(r'tariff_cards', TariffPageViewSet)
router.register(r'tariffs', TariffViewSet)


urlpatterns = [
    path('', include(router.urls)),
]

