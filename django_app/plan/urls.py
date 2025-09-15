from django.urls import path

from .views import *

urlpatterns = [
    path('plan_table/', get_plan_table),
    path('set_target_date/', set_target_date),

    path('get_projects/', get_projects),
    path('get_agents/', get_agents),
    path('get_managers/', get_managers),
]
