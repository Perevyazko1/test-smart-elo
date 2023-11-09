from dataclasses import asdict

from django.db.models import Sum
from django.http import JsonResponse
from rest_framework import viewsets
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import AllowAny

from core.models import OrderProduct, Assignment
from core.pages.new_eq.serializers.serializers import EqCardSerializer
from core.pages.new_eq.services.get_eq_req_params import get_eq_req_params
from core.pages.new_eq.views.get_eq_card_queryset import get_eq_card_queryset
from core.pages.new_eq.views.get_target_list_name_from_req import get_target_list_name_from_req
from core.services.get_week_info import GetWeekInfo
from staff.models import Transaction
from .get_project_filter import get_project_filters
from .get_view_modes import get_view_modes
from .update_assignments import UpdateAssignments


class GetEqCards(viewsets.ModelViewSet):
    queryset = OrderProduct.objects.all()
    serializer_class = EqCardSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['eq_params'] = get_eq_req_params(request=self.request)
        context['target_list'] = get_target_list_name_from_req(request=self.request)
        return context

    def get_queryset(self):
        qs = super().get_queryset()
        qs = get_eq_card_queryset(queryset=qs, request=self.request)
        return qs


@api_view(['POST'])
def update_card(request):
    print(request)
    eq_params = get_eq_req_params(request=request)
    series_id: str = request.data.get('series_id')
    variant: str = request.data.get('variant')
    numbers: list[int] = request.data.get('numbers')
    action: str = request.data.get('action')

    UpdateAssignments(series_id=series_id,
                      department_number=eq_params.department_number,
                      numbers=numbers,
                      action=action,
                      pin_code=eq_params.pin_code,
                      view_mode=eq_params.view_mode_key
                      ).execute()

    queryset = OrderProduct.objects.get(series_id=series_id)

    if variant == 'desktop':
        return JsonResponse({
            "await": EqCardSerializer(queryset, context={
                'eq_params': eq_params,
                'target_list': 'await',
            }).data,
            "in_work": EqCardSerializer(queryset, context={
                'eq_params': eq_params,
                'target_list': 'in_work',
            }).data,
            "ready": EqCardSerializer(queryset, context={
                'eq_params': eq_params,
                'target_list': 'ready',
            }).data,
        }, json_dumps_params={"ensure_ascii": False})
    else:
        return JsonResponse({
            "mobile": EqCardSerializer(queryset, context={
                'eq_params': eq_params,
                'target_list': 'mobile',
            }).data,
        }, json_dumps_params={"ensure_ascii": False})


@api_view(['GET'])
def get_eq_filters(request):
    eq_params = get_eq_req_params(request=request)
    mode = request.query_params.get('project_mode')

    project_filters = get_project_filters(mode)
    view_modes = get_view_modes(eq_params.department_number)

    return JsonResponse({
        "view_modes": view_modes,
        "project_filters": project_filters,
    }, json_dumps_params={"ensure_ascii": False})


@api_view(['GET'])
def get_week_data(request):
    eq_params = get_eq_req_params(request=request)

    # if len(eq_params.view_mode_key) == 6:
    #     eq_params.pin_code = eq_params.view_mode_key
    # TODO Добавить расчет от лица сотрудника отдела
    week_info = GetWeekInfo(week=eq_params.week, year=eq_params.year).execute()

    earned = Assignment.objects.filter(
        executor__pin_code=eq_params.pin_code,
        department__number=eq_params.department_number,
        inspector__isnull=False,
        date_completion__gte=week_info.date_range[0],
        date_completion__lt=week_info.date_range[1],
    ).aggregate(Sum('tariff__tariff')).get('tariff__tariff__sum')

    transactions_sum = Transaction.objects.filter(
        employee__pin_code=eq_params.pin_code,
        inspect_date__gte=week_info.date_range[0],
        inspect_date__lt=week_info.date_range[1],
        transaction_type="accrual",
        details__in=['prize', 'fine']
    ).aggregate(Sum('amount')).get('amount__sum')

    week_info.earned = f'{earned or "0"}'
    if transactions_sum:
        week_info.earned += f' + {int(transactions_sum)}(доп)'

    return JsonResponse(asdict(week_info), json_dumps_params={"ensure_ascii": False})


@api_view(['GET'])
def get_card(request):
    eq_params = get_eq_req_params(request=request)
    series_id: str = request.query_params.get('series_id')
    variant: str = request.query_params.get('variant')

    queryset = OrderProduct.objects.get(series_id=series_id)

    if variant == 'desktop':
        return JsonResponse({
            "await": EqCardSerializer(queryset, context={
                'eq_params': eq_params,
                'target_list': 'await',
            }).data,
            "in_work": EqCardSerializer(queryset, context={
                'eq_params': eq_params,
                'target_list': 'in_work',
            }).data,
            "ready": EqCardSerializer(queryset, context={
                'eq_params': eq_params,
                'target_list': 'ready',
            }).data,
        }, json_dumps_params={"ensure_ascii": False})
    else:
        return JsonResponse({
            "mobile": EqCardSerializer(queryset, context={
                'eq_params': eq_params,
                'target_list': 'mobile',
            }).data,
        }, json_dumps_params={"ensure_ascii": False})
