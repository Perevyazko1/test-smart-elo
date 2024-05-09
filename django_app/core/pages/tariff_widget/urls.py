"""Views for tariff widget. """
from django.urls import path

from .views import (
    set_tariff_card,
    get_tariff_card
)

urlpatterns = [
    path('get_card/', get_tariff_card),
    path('set_card/', set_tariff_card),
]
