"""Urls for tariffication. """
from django.urls import (
    path,
    include,
)
from rest_framework import routers

from .views import (
    get_projects,
    TarifficationPageListViewSet,
    set_proposed_tariff,
    get_post_tariffication_list,
    set_confirmed_tariff,
    set_post_tariffication,
    get_tariffication_history,
)

router = routers.DefaultRouter()
router.register(r'tariffication_list', TarifficationPageListViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('projects/', get_projects),
    path('set_proposed_tariff/', set_proposed_tariff),
    path('get_post_tariffication_list/', get_post_tariffication_list),
    path('set_confirmed_tariff/', set_confirmed_tariff),
    path('set_post_tariffication/', set_post_tariffication),
    path('get_tariffication_history/', get_tariffication_history),
]
