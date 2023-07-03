from django.urls import path, include
from rest_framework import routers

from core.pages.new_eq.views.views import GetEqCards, update_card, get_eq_filters, get_week_data, get_card

router = routers.DefaultRouter()
router.register(r'get_eq_cards', GetEqCards)


urlpatterns = [
    path('', include(router.urls)),
    path('update_card/', update_card),
    path('get_eq_filters/', get_eq_filters),
    path('get_week_data/', get_week_data),
    path('get_card/', get_card),
]
