from django.urls import path, include
from rest_framework import routers

from .views.views import (
    GetEqCards, update_card, get_eq_filters, get_week_data, get_card, update_assignments)

router = routers.DefaultRouter()
router.register(r'get_eq_cards', GetEqCards)


urlpatterns = [
    path('', include(router.urls)),
    path('update_card/', update_card),
    path('update_assignments_info/', update_assignments),
    path('get_eq_filters/', get_eq_filters),
    path('get_week_data/', get_week_data),
    path('get_card/', get_card),
]
