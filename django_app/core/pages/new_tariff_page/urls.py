from rest_framework import routers
from django.urls import path, include

from core.pages.new_tariff_page.views import (TariffPageViewSet,
                                              TariffViewSet,
                                              RetarifficationViewSet,
                                              post_retariffication)

router = routers.DefaultRouter()
router.register(r'tariff_cards', TariffPageViewSet)
router.register(r'tariffs', TariffViewSet)
router.register(r'retariffication', RetarifficationViewSet)


urlpatterns = [
    path('', include(router.urls)),
    path('post_retariffication/', post_retariffication),
]

