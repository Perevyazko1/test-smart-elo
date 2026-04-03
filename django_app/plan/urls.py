from django.urls import path

from .views import *

urlpatterns = [
    path('plan_table/', get_plan_table),
    path('set_target_date/', set_target_date),

    path('get_projects/', get_projects),
    path('get_agents/', get_agents),
    path('get_managers/', get_managers),

    path('ai_plan/', get_ai_plan),
    path('ai_plan/update_feedback/', update_ai_feedback),
    path('ai_plan/update_config/', update_ai_config),
    path('ai_plan/generate/', generate_ai_plan),
    path('ai_plan/prompt/', process_ai_prompt),
]
