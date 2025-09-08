from django.urls import path

from .views import *

urlpatterns = [
    path('plan_table/', get_plan_table),
    path('set_target_date/', set_target_date),
]
