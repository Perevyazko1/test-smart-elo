"""Order page views. """
from django.http import JsonResponse

from rest_framework import viewsets
from rest_framework.decorators import api_view

from staff.models import Audit
from ...models import (Order,
                       OrderProductComment,
                       OrderProduct,
                       )

from .filters import OrderModelFilter
from .serializers import (
    OrderPageListSerializer,
    OrderPageDetailsSerializer,
    OrderProductSerializer,
)


class OrderPageViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    filterset_class = OrderModelFilter
    serializer_class = OrderPageDetailsSerializer

    def get_serializer_class(self, *args, **kwargs):
        if self.action == 'list':
            return OrderPageListSerializer
        return self.serializer_class


@api_view(['POST'])
def add_comment(request):
    """Add comment method. """
    series_id: str = request.data.get('series_id')
    comment: str = request.data.get('comment')
    order_product = OrderProduct.objects.get(
        series_id=series_id
    )

    OrderProductComment.objects.create(
        author=request.user,
        order_product=order_product,
        important=False,
        text=comment,
    )

    data = OrderProductSerializer(order_product).data
    return JsonResponse(data, json_dumps_params={"ensure_ascii": False})


@api_view(['POST'])
def edit_comment(request):
    """Edit comment method. """
    op_id: str = request.data.get('op_id')
    action: str = request.data.get('action')
    comment_id: str = request.data.get('comment_id')
    order_product = OrderProduct.objects.get(
        id=op_id
    )

    target_comment = OrderProductComment.objects.get(
        id=comment_id
    )

    match action:
        case "delete":
            target_comment.deleted = True
        case "-delete":
            target_comment.deleted = False
        case "important":
            target_comment.important = True
        case "-important":
            target_comment.important = False
        case _:
            print(f'Неизвестный action: {action}')
    target_comment.save()

    Audit.objects.create(
        employee=request.user,
        details=f"Изменил комментарий № {target_comment.id} для серии {order_product.series_id}. Изменение: {action}"
    )

    data = OrderProductSerializer(order_product).data
    return JsonResponse(data, json_dumps_params={"ensure_ascii": False})
