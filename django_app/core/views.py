from dataclasses import asdict

from django.http import JsonResponse
from django.shortcuts import redirect
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .api_moy_sklad.services.import_orders import ImportOrders
from .eq_serializers.eq_card_serializers import EQCardSerializer
from .methods.get_week_info import GetWeekInfo
from .methods.update_assignments import UpdateAssignments
from .models import OrderProduct, Order


def import_orders(request):
    # from .methods.init_departments import init_departments
    # init_departments()
    ImportOrders().execute()
    return redirect(request.META.get('HTTP_REFERER'))


@api_view(['POST'])
def update_assignments(request):
    if request.method == 'POST':
        series_id: str = request.data.get('series_id')
        department_number: int = request.data.get('department_number')
        numbers: list[int] = request.data.get('numbers')
        action: str = request.data.get('action')
        pin_code = request.data.get('pin_code')

        print(series_id, department_number, numbers, action, pin_code)

        UpdateAssignments.execute(
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
        )

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
        if not project == 'Все проекты':
            qs = qs.filter(order__project=project)

        week = self.request.query_params.get('week')
        year = self.request.query_params.get('year')
        if week and week.isdigit():
            week = int(week)
        else:
            week = None
        if year and year.isdigit():
            year = int(year)
        else:
            year = None

        week_info = GetWeekInfo(week=week, year=year).execute()

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
    print(result)

    return JsonResponse({"data": result}, json_dumps_params={"ensure_ascii": False})


#
#     def _get_status_list(self) -> list[str]:
#         status_param: str = self.request.query_params.get('status_list')
#         if status_param:
#             return list(status_param.split(','))
#         return []
#
#
# class ProductViewSet(viewsets.ModelViewSet):
#     queryset = Product.objects.all()
#     serializer_class = ProductSerializer
#
#
# class ProductPictureViewSet(viewsets.ModelViewSet):
#     queryset = ProductPicture.objects.all()
#     serializer_class = ProductPictureSerializer
#
#
# class FabricViewSet(viewsets.ModelViewSet):
#     queryset = Fabric.objects.all()
#     serializer_class = FabricSerializer
#
#
# class OrderViewSet(viewsets.ModelViewSet):
#     queryset = Order.objects.all()
#     serializer_class = OrderSerializer
#
#
# class OrderProductViewSet(viewsets.ModelViewSet):
#     queryset = OrderProduct.objects.all()
#     serializer_class = OrderProductSerializer
#
#
# class AssignmentViewSet(viewsets.ModelViewSet):
#     queryset = Assignment.objects.all()
#     serializer_class = AssignmentSerializer
#
#
# class ProductionStepViewSet(viewsets.ModelViewSet):
#     queryset = ProductionStep.objects.all()
#     serializer_class = ProductionStepSerializer
#
#
# class TechnologicalProcessViewSet(viewsets.ModelViewSet):
#     queryset = TechnologicalProcess.objects.all()
#     serializer_class = TechnologicalProcessSerializer
#
#

#
#
# @api_view(['GET'])
# def get_eq_data(request):
#     filters = ["Все изделия", "Серийная мебель", "Novembry"]
#
#     qs_await_list = OrderProduct.objects.filter(
#         assignments__status__in=['await', 'in_work'],
#         assignments__department__number=request.query_params.get('department_number')
#     )
#
#     qs_in_work_list = OrderProduct.objects.filter(
#         assignments__status='in_work',
#         assignments__department__number=request.query_params.get('department_number')
#     )
#
#     qs_ready_list = OrderProduct.objects.filter(
#         assignments__status='ready',
#         assignments__department__number=request.query_params.get('department_number')
#     )
#
#     serializer = EQDataSerializer({
#         'await_list': qs_await_list,
#         'in_work_list': qs_in_work_list,
#         'ready_list': qs_ready_list,
#         'week_info': {'week_info': 'info1'},
#         'project_filters': filters,
#         'view_modes': {'view_modes': 'mode1'},
#     }, context={'request': request})
#
#     return Response(serializer.data)
