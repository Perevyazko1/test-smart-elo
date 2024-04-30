"""Order page views. """
from django.http import JsonResponse

from rest_framework import viewsets
from rest_framework.decorators import api_view

from ...models import (Order,
                       OrderProductComment,
                       OrderProduct,
                       )

from .serializers import (
    OrderPageListSerializer,
    OrderPageDetailsSerializer,
    OrderProductSerializer,
)


class OrderPageViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
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
