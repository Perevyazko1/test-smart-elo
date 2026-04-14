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
    path('ai_plan/progress/', ai_plan_progress),
    path('ai_plan/cancel/', ai_plan_cancel),
    path('ai_plan/reset/', reset_ai_plan),
    path('ai_plan/weights/', get_weight_coefficients),
    path('ai_plan/weights/update/', save_weight_coefficients),
    path('ai_plan/prompt/', process_ai_prompt),
    path('ai_plan/search/', search_orders),
    path('ai_plan/update_entries/', update_ai_entries),

    path('norms/', get_production_norms),
    path('norms/update/', update_production_norms),
    path('norms/add_type/', add_product_type),
    path('norms/delete_type/', delete_product_type),

    path('products/untyped/', get_untyped_products),
    path('products/set_types/', set_product_types),
    path('products/classify/', classify_products),

    path('product_detail/<int:product_id>/', get_product_detail),
    path('product_norms/batch/', get_product_norms_batch),
    path('product_norms/<int:product_id>/', get_product_norms),
    path('product_norms/<int:product_id>/update/', update_product_norms),

    path('chart/', get_chart_data),
    path('chart/refresh/', refresh_chart),
    path('departments/', get_departments),
    path('workers/', get_department_workers),
    path('workers/update/', update_department_workers),
    path('workers/load/', update_target_load),

    path('batch_bonuses/', get_batch_bonuses),
    path('batch_bonuses/update/', update_batch_bonuses),

    path('workflow/<int:product_type_id>/', get_workflow),
    path('workflow/<int:product_type_id>/update/', update_workflow),

    path('comments/add/', add_comment),
]
