"""Views for tariffication page. """
import datetime
from typing import List

from django.db import transaction
from django.db.models import Q
from django.http import JsonResponse
from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from core.models import (
    Order,
    ProductionStep,
    ProductionStepComment,
    OrderProduct,
    Tariff,
    Assignment,
    AssignmentCoExecutor,
)
from salary.service.make_earning import make_earning
from staff.models import (
    Audit,
)
from .filters import TarifficationPageListFilter
from .serializers import (
    PageListSerializer,
    PostTarifficationSerializer, TariffSerializer,
)
from ...consumers import EqNotificationActions, ws_group_updates


@api_view(['GET'])
def get_projects(request):
    """Get project filter list. """
    mode = request.query_params.get('mode')

    if mode == 'all':
        projects = list(Order.objects.all().distinct('project').values_list('project', flat=True))
    else:
        projects = list(
            Order.objects
            .filter(order_products__status=0)
            .distinct('project')
            .values_list('project', flat=True)
        )

    result = ['Все проекты']

    result += projects

    return JsonResponse({"project_list": result}, json_dumps_params={"ensure_ascii": False})


class TarifficationPageListViewSet(viewsets.ModelViewSet):
    """ViewSet for tariff page list. """
    queryset = ProductionStep.objects.all()
    serializer_class = PageListSerializer
    filterset_class = TarifficationPageListFilter

    def get_queryset(self):
        qs = super().get_queryset()
        qs = qs.filter(
            department__in=self.request.user.departments.all(),
            department__piecework_wages=True,
        )

        return qs.order_by('product')


@api_view(['POST'])
@transaction.atomic
def set_proposed_tariff(request):
    """Set tariffication. """
    production_step__id = request.data.get('production_step__id')
    amount = request.data.get('amount')

    production_step = ProductionStep.objects.get(
        id=production_step__id,
    )

    new_tariff = Tariff.objects.create(
        amount=amount,
        created_by=request.user,
        comment=f'#PS-{production_step.id}# Предложен тариф.'
    )

    production_step.proposed_tariff = new_tariff
    production_step.save()

    detail = f'Предложил тариф в размере {amount} для этапа производства id: {production_step.id}'
    Audit.objects.create(
        employee=request.user,
        details=detail,
    )

    ProductionStepComment.objects.create(
        author=request.user,
        comment=detail,
        production_step=production_step
    )

    """Send update command for EQ page cards. """
    active_order_products = OrderProduct.objects.filter(
        product=production_step.product,
        status="0",
    )

    for order_product in active_order_products:

        notification_data = {str(production_step.department.number): {
            'action': EqNotificationActions.UPDATE_TARGET_ITEM.value,
            'data': order_product.id,
        }}

        ws_group_updates(
            pin_code="",
            notification_data=notification_data
        )

    return Response("ok", status=status.HTTP_200_OK)


@api_view(['GET'])
def get_post_tariffication_list(request):
    """Get post tariffication list. """
    production_step__id = request.query_params.get('production_step__id')

    serializer = PostTarifficationSerializer

    production_step = ProductionStep.objects.get(id=production_step__id)

    return Response(serializer(production_step).data, status=status.HTTP_200_OK)


@api_view(['POST'])
@transaction.atomic
def set_confirmed_tariff(request):
    """Set tariffication. """
    production_step__id = request.data.get('production_step__id')
    tariff__id = request.data.get('tariff__id')

    production_step = ProductionStep.objects.get(
        id=production_step__id,
    )
    tariff = Tariff.objects.get(
        id=tariff__id
    )

    new_tariff = Tariff.objects.create(
        amount=tariff.amount,
        created_by=request.user,
        comment=f'#PS-{production_step.id}# Утвержден тариф. '
    )

    production_step.confirmed_tariff = new_tariff
    production_step.save()

    """Send update command for EQ page cards. """
    active_order_products = OrderProduct.objects.filter(
        product=production_step.product,
        status="0",
    )

    # Циклы разнесены чтобы кеш успевал обновиться
    for order_product in active_order_products:

        assignments_for_update = Assignment.objects.filter(
            order_product=order_product,
            department=production_step.department,
            inspector__isnull=True,
        )
        assignments_for_update.update(
            new_tariff=new_tariff,
            amount=new_tariff.amount,
        )

        AssignmentCoExecutor.objects.filter(
            assignment__in=assignments_for_update
        ).distinct().update(amount=0)

        notification_data = {str(production_step.department.number): {
            'action': EqNotificationActions.UPDATE_TARGET_ITEM.value,
            'data': order_product.id,
        }}

        ws_group_updates(
            pin_code="",
            notification_data=notification_data
        )

    detail = f'Утвердил тариф в размере {new_tariff.amount} для этапа производства id: {production_step.id}'

    Audit.objects.create(
        employee=request.user,
        details=detail,
    )
    ProductionStepComment.objects.create(
        author=request.user,
        comment=detail,
        production_step=production_step
    )

    return Response("ok", status=status.HTTP_200_OK)


@api_view(['POST'])
@transaction.atomic
def set_post_tariffication(request):
    """Set tariff for post tariffication. """
    production_step__id: int = request.data.get('production_step__id')
    tariff__id: int = request.data.get('tariff__id')
    target__ids: List[int] = request.data.get('target__ids')
    zero_tariff__ids: List[int] = request.data.get('zero_tariff__ids')

    serializer = PostTarifficationSerializer

    production_step = ProductionStep.objects.get(
        id=production_step__id,
    )

    # Обновление нарядов с нулевой тарификацией
    zero_tariff = Tariff.objects.create(
        amount=0,
        created_by=request.user,
        comment=f'#PS-{production_step.id}# Утвержден тариф 0 для {len(zero_tariff__ids)} нарядов.'
    )

    zero_tariff_assignments = Assignment.objects.filter(
        id__in=zero_tariff__ids
    )

    for assignment in zero_tariff_assignments:
        assignment.tariffication_date = assignment.inspect_date
        assignment.new_tariff = zero_tariff
        assignment.save()

    # Обновление тарифа для этапа производства
    tariff = Tariff.objects.get(
        id=tariff__id,
    )
    new_tariff = Tariff.objects.create(
        amount=tariff.amount,
        created_by=request.user,
        comment=f'#PS-{production_step.id}# Утвержден тариф.'
    )

    production_step.confirmed_tariff = new_tariff
    production_step.save()

    # Обновление тарифа для всех изделий из хвостов
    assignments_qs = Assignment.objects.filter(
        id__in=target__ids,
    )
    assignments_qs.update(
        tariffication_date=datetime.datetime.now(),
        new_tariff=new_tariff,
        amount=new_tariff.amount,
    )

    # Начисление ЗП по тарифицированным нарядам
    for assignment in assignments_qs:
        description = (
            f'{assignment.department.name}'
            f'Производство ЭЛО - {assignment.order_product.product.name}'
        )
        if assignment.executor.piecework_wages:
            earning = make_earning(
                earning_type="ЭЛО",
                amount=assignment.new_tariff.amount,
                user=assignment.executor,
                created_by=request.user,
                approval_by=request.user,
                target_date=assignment.date_completion,
                comment=description,
                earning_comment=str(assignment),
            )
            assignment.tariffication_date = earning.target_date
            assignment.save()

    # Создаем аудит
    detail = (
        f'Утвердил тариф в размере {new_tariff.amount} для этапа производства id: {production_step.id}. '
        f'Начислена ЗП для {len(target__ids)} нарядов. '
    )
    Audit.objects.create(
        employee=request.user,
        details=detail,
    )
    ProductionStepComment.objects.create(
        author=request.user,
        comment=detail,
        production_step=production_step
    )

    """Обновляем все оставшиеся активные наряды"""
    assignments_for_update = Assignment.objects.filter(
        order_product__product=production_step.product,
        department=production_step.department,
        inspector__isnull=True,
    )

    assignments_for_update.update(
        new_tariff=new_tariff,
        amount=new_tariff.amount,
    )
    AssignmentCoExecutor.objects.filter(
        assignment__in=assignments_for_update
    ).distinct().update(amount=0)

    all_ids = [*zero_tariff__ids, *target__ids]

    """Делаем рассылку на обновление карточек в ЭЛО. """
    order_products = OrderProduct.objects.filter(
        Q(
            assignments__id__in=all_ids
        ) |
        Q(
            product=production_step.product,
            status="0",
        )
    ).distinct()

    for order_product in order_products:
        notification_data = {str(production_step.department.number): {
            'action': EqNotificationActions.UPDATE_TARGET_ITEM.value,
            'data': order_product.id,
        }}

        ws_group_updates(
            pin_code="",
            notification_data=notification_data
        )

    return Response(serializer(production_step.refresh_from_db()).data, status=status.HTTP_200_OK)


@api_view(['GET'])
def get_tariffication_history(request):
    """Get tariffication history. """
    production_step__id = request.query_params.get('production_step__id')

    tariffs_qs = Tariff.objects.filter(
        comment__startswith=f'#PS-{production_step__id}#'
    ).order_by('-id')

    serializer = TariffSerializer

    return Response(serializer(tariffs_qs, many=True).data, status=status.HTTP_200_OK)
