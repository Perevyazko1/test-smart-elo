from dataclasses import asdict

from django.http import JsonResponse
from django.shortcuts import redirect
from rest_framework import viewsets
from rest_framework.decorators import api_view

from staff.models import Employee

from .api_moy_sklad.services.import_orders import ImportOrders
from .eq_serializers.eq_card_serializers import EQCardSerializer, EQTechProcessSerializer
from .methods.get_week_info import GetWeekInfo
from .methods.update_assignments import UpdateAssignments
from .models import OrderProduct, Order, TechnologicalProcess


def import_orders(request):
    # from .methods.init_departments import init_departments
    # init_departments()
    ImportOrders().execute()
    return redirect(request.META.get('HTTP_REFERER'))


@api_view(['POST'])
def update_assignments(request):
    series_id: str = request.data.get('series_id')
    department_number: int = request.data.get('department_number')
    numbers: list[int] = request.data.get('numbers')
    action: str = request.data.get('action')
    pin_code = request.data.get('pin_code')

    print(series_id, department_number, numbers, action, pin_code)

    UpdateAssignments().execute(
        series_id=series_id,
        department_number=department_number,
        numbers=numbers,
        action=action,
        pin_code=pin_code,
    )

    return JsonResponse({"data": 'okay'})


class GetAwaitList(viewsets.ModelViewSet):
    queryset = OrderProduct.objects.all()
    serializer_class = EQCardSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['status_list'] = ['await', 'in_work']
        context['department_number'] = self.request.query_params.get('department_number')
        return context

    def get_queryset(self):
        qs = super().get_queryset()

        project = self.request.query_params.get('project')
        if not project == 'Все проекты':
            qs = qs.filter(order__project=project)

        qs = qs.filter(
            assignments__status__in=['await', 'in_work'],
            assignments__department__number=self.request.query_params.get('department_number')
        ).distinct()

        return qs


class GetInWorkList(viewsets.ModelViewSet):
    queryset = OrderProduct.objects.all()
    serializer_class = EQCardSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['status_list'] = ['in_work']
        context['department_number'] = self.request.query_params.get('department_number')
        return context

    def get_queryset(self):
        qs = super().get_queryset()

        project = self.request.query_params.get('project')
        if not project == 'Все проекты':
            qs = qs.filter(order__project=project)

        qs = qs.filter(
            assignments__status__in=['in_work'],
            assignments__department__number=self.request.query_params.get('department_number')
        )
        return qs


class GetReadyList(viewsets.ModelViewSet):
    queryset = OrderProduct.objects.all()
    serializer_class = EQCardSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['status_list'] = ['ready']
        context['department_number'] = self.request.query_params.get('department_number')
        return context

    def get_queryset(self):
        qs = super().get_queryset()

        project = self.request.query_params.get('project')
        week = self.request.query_params.get('week')
        year = self.request.query_params.get('year')
        pin_code = self.request.query_params.get('pin_code')
        view_mode = self.request.query_params.get('view_mode')

        if week and week.isdigit():
            week = int(week)
        else:
            week = None
        if year and year.isdigit():
            year = int(year)
        else:
            year = None

        week_info = GetWeekInfo(week=week, year=year).execute()

        if len(view_mode) == 6:
            pin_code = view_mode

        if not view_mode == '1':
            qs = qs.filter(assignments__executor__pin_code=pin_code)

        if not project == 'Все проекты':
            qs = qs.filter(order__project=project)

        qs = qs.filter(
            assignments__status__in=['ready'],
            assignments__department__number=self.request.query_params.get('department_number'),
            assignments__date_completion__gte=week_info.date_range[0],
            assignments__date_completion__lt=week_info.date_range[1],
        )

        return qs


@api_view(['GET'])
def get_week_info(request):
    week = request.query_params.get('week')
    if week and week.isdigit():
        week = int(week)
    else:
        week = None
    year = request.query_params.get('year')
    if year and year.isdigit():
        year = int(year)
    else:
        year = None

    week_info = GetWeekInfo(week=week, year=year).execute()

    return JsonResponse(asdict(week_info))


@api_view(['GET'])
def get_project_filters(request):
    result = ['Все проекты']
    projects = list(Order.objects.all().distinct('project').values_list('project', flat=True))

    result += projects

    return JsonResponse({"data": result}, json_dumps_params={"ensure_ascii": False})


@api_view(['GET'])
def get_view_modes(request):
    result = [{'name': 'Личные наряды', 'key': 0}, {'name': 'Режим бригадира', 'key': 1}]

    users = Employee.objects.all()

    for user in users:
        result.append({'name': f'{user.first_name} {user.last_name}', 'key': user.pin_code})

    return JsonResponse({"view_modes": result}, json_dumps_params={"ensure_ascii": False})


@api_view(['GET'])
def get_tech_process_info(request):
    qs = TechnologicalProcess.objects.all()
    serializer = EQTechProcessSerializer
    data = serializer(qs, many=True, context={"request": request}).data

    return JsonResponse({"data": data}, json_dumps_params={"ensure_ascii": False})


@api_view(['POST'])
def set_tech_process(request):
    series_id = request.data.get('series_id')
    tech_process_id = request.data.get('tech_process_id')
    serializer = EQTechProcessSerializer

    product = OrderProduct.objects.get(series_id=series_id).product
    technological_process = TechnologicalProcess.objects.get(pk=tech_process_id)

    product.technological_process = technological_process
    product.save()

    data = serializer(technological_process, context={'request': request}).data

    return JsonResponse({"data": data}, json_dumps_params={"ensure_ascii": False})
