from dataclasses import asdict

from django.db.models import Sum
from django.http import JsonResponse
from rest_framework import viewsets
from rest_framework.decorators import api_view

from core.models import OrderProduct, Assignment, TechnologicalProcess, ProductionStep
from core.pages.eq_page.serializers import EQCardSerializer
from core.pages.eq_page.services.await_view_mode_filter import await_view_mode_filter
from core.pages.eq_page.services.check_schema import check_schema
from core.pages.eq_page.services.create_custom_tech_process import create_custom_tech_process
from core.pages.eq_page.services.in_work_view_mode_filter import in_work_view_mode_filter
from core.pages.eq_page.services.ready_view_mode_filter import ready_view_mode_filter
from core.pages.eq_page.services.update_assignments import UpdateAssignments
from core.serializers import TechProcessSerializer
from core.services.get_week_info import GetWeekInfo
from staff.models import Employee, Audit


@api_view(['POST'])
def update_assignments(request):
    series_id: str = request.data.get('series_id')
    view_mode: str = request.data.get('view_mode')
    department_number: int = request.data.get('department_number')
    numbers: list[int] = request.data.get('numbers')
    action: str = request.data.get('action')
    pin_code = request.data.get('pin_code')

    UpdateAssignments(series_id=series_id,
                      department_number=department_number,
                      numbers=numbers,
                      action=action,
                      pin_code=pin_code,
                      view_mode=view_mode
                      ).execute()

    return JsonResponse({"data": 'okay'})


class GetAwaitList(viewsets.ModelViewSet):
    queryset = OrderProduct.objects.all()
    serializer_class = EQCardSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['status_list'] = ['await', 'in_work']
        context['view_mode'] = self.request.query_params.get('view_mode')
        context['pin_code'] = self.request.query_params.get('pin_code')
        context['department_number'] = self.request.query_params.get('department_number')
        return context

    def get_queryset(self):
        qs = super().get_queryset()
        view_mode = self.request.query_params.get('view_mode')
        department_number = self.request.query_params.get('department_number')
        project = self.request.query_params.get('project')

        if not project == 'Все проекты':
            qs = qs.filter(order__project=project).distinct()

        return await_view_mode_filter(queryset=qs,
                                      view_mode=view_mode,
                                      department_number=department_number
                                      ).order_by('urgency', 'series_id')


class GetInWorkList(viewsets.ModelViewSet):
    queryset = OrderProduct.objects.all()
    serializer_class = EQCardSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['status_list'] = ['in_work']
        context['department_number'] = self.request.query_params.get('department_number')
        context['pin_code'] = self.request.query_params.get('pin_code')
        context['view_mode'] = self.request.query_params.get('view_mode')
        return context

    def get_queryset(self):
        qs = super().get_queryset()

        view_mode = self.request.query_params.get('view_mode')
        pin_code = self.request.query_params.get('pin_code')
        project = self.request.query_params.get('project')
        department_number = self.request.query_params.get('department_number')

        if not project == 'Все проекты':
            qs = qs.filter(order__project=project).distinct()

        return in_work_view_mode_filter(view_mode=view_mode,
                                        department_number=department_number,
                                        pin_code=pin_code,
                                        queryset=qs)


class GetReadyList(viewsets.ModelViewSet):
    queryset = OrderProduct.objects.all()
    serializer_class = EQCardSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['status_list'] = ['ready']
        context['department_number'] = self.request.query_params.get('department_number')
        context['week'] = self.request.query_params.get('week')
        context['year'] = self.request.query_params.get('year')
        context['view_mode'] = self.request.query_params.get('view_mode')
        context['pin_code'] = self.request.query_params.get('pin_code')
        return context

    def get_queryset(self):
        qs = super().get_queryset()

        project = self.request.query_params.get('project')
        week = self.request.query_params.get('week')
        year = self.request.query_params.get('year')
        pin_code = self.request.query_params.get('pin_code')
        view_mode = self.request.query_params.get('view_mode')
        department_number = self.request.query_params.get('department_number')

        week_info = GetWeekInfo(week=week, year=year).execute()

        if not project == 'Все проекты':
            qs = qs.filter(order__project=project).distinct()

        return ready_view_mode_filter(queryset=qs,
                                      view_mode=view_mode,
                                      pin_code=pin_code,
                                      department_number=department_number,
                                      week_info=week_info)


@api_view(['GET'])
def get_week_info(request):
    week = request.query_params.get('week')
    year = request.query_params.get('year')
    pin_code = request.query_params.get('pin_code')
    department_number = request.query_params.get('department_number')
    view_mode = request.query_params.get('view_mode')

    if len(str(view_mode)) == 6:
        pin_code = view_mode

    week_info = GetWeekInfo(week=week, year=year).execute()

    earned = Assignment.objects.filter(
        executor__pin_code=pin_code,
        department__number=department_number,
        inspector__isnull=False,
        date_completion__gte=week_info.date_range[0],
        date_completion__lt=week_info.date_range[1],
    ).aggregate(Sum('tariff__tariff')).get('tariff__tariff__sum')

    week_info.earned = earned

    return JsonResponse(asdict(week_info))


@api_view(['GET'])
def get_view_modes(request):
    department_number = request.query_params.get('department_number')
    result = []

    users = Employee.objects.filter(departments__number=department_number).exclude(
        groups__name='Администраторы'
    )

    for user in users:
        result.append({'name': f'{user.first_name} {user.last_name}', 'key': user.pin_code})

    return JsonResponse({"view_modes": result}, json_dumps_params={"ensure_ascii": False})


@api_view(['GET'])
def get_tech_process_info(request):
    qs = TechnologicalProcess.objects.exclude(image='').order_by('name')
    serializer = TechProcessSerializer
    data = serializer(qs, many=True, context={"request": request}).data

    return JsonResponse({"data": data}, json_dumps_params={"ensure_ascii": False})


@api_view(['POST'])
def set_tech_process(request):
    series_id = request.data.get('series_id')
    pin_code = request.data.get('pin_code')
    tech_process_id = request.data.get('tech_process_id')
    serializer = TechProcessSerializer

    product = OrderProduct.objects.get(series_id=series_id).product
    technological_process = TechnologicalProcess.objects.get(pk=tech_process_id)

    product.technological_process = technological_process
    product.save()

    data = serializer(technological_process, context={'request': request}).data

    Audit.objects.create(
        employee=Employee.objects.get(pin_code=pin_code),
        audit_type="edit",
        details=f"Назначил технологический процесс: {technological_process.name}, "
                f"для изделия: {product.name}"
    )

    return JsonResponse({"data": data}, json_dumps_params={"ensure_ascii": False})


@api_view(['GET'])
def get_order_product_info(request):
    # TODO декомпозировать функцию
    series_id = request.query_params.get('series_id')
    department_number = request.query_params.get('department_number')

    order_product = OrderProduct.objects.get(series_id=series_id)

    employees = Employee.objects.filter(
        departments__number=department_number
    )

    production_steps = ProductionStep.objects.filter(
        product=order_product.product,
    ).exclude(department__number=0).exclude(department__number=50)

    department_info = []
    production_info = []

    for employee in employees:
        employee_assignments = Assignment.objects.filter(
            order_product=order_product,
            executor=employee,
            department__number=department_number,
        )
        department_info.append(
            {
                "full_name": f"{employee.first_name} {employee.last_name}",
                "in_work": employee_assignments.filter(status="in_work").count(),
                "ready": employee_assignments.filter(status="ready").count(),
                "confirmed": employee_assignments.filter(
                    inspector__isnull=False,
                    status="ready"
                ).count(),
            }
        )

    for production_step in production_steps:
        department_assignments = Assignment.objects.filter(
            order_product=order_product,
            department=production_step.department,
        )
        production_info.append(
            {
                "department_name": production_step.department.name,
                "in_work": department_assignments.filter(status="in_work").count(),
                "ready": department_assignments.filter(status="ready").count(),
                "confirmed": department_assignments.filter(
                    inspector__isnull=False,
                    status="ready",
                ).count(),
            }
        )

    return JsonResponse({
        "department_info": department_info,
        "production_info": production_info,
    }, json_dumps_params={"ensure_ascii": False})


@api_view(['POST'])
def set_custom_tech_process(request):
    schema = request.data.get('schema')
    pin_code = request.data.get('pin_code')
    series_id = request.data.get('series_id')

    if check_schema(schema):
        technological_process = create_custom_tech_process(schema=schema, series_id=series_id)
        serializer = TechProcessSerializer
        data = serializer(technological_process, context={'request': request}).data

        Audit.objects.create(
            employee=Employee.objects.get(pin_code=pin_code),
            audit_type="edit",
            details=f"Назначил специальный технологический процесс: {technological_process.name}, "
                    f"для изделия: {technological_process.product_set.first().name}"
        )
        return JsonResponse({
            "data": data
        }, json_dumps_params={"ensure_ascii": False})

    else:
        return JsonResponse({"error": 'Не корректная схема'}, json_dumps_params={"ensure_ascii": False})
