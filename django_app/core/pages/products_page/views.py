from rest_framework import viewsets
from core.models import Product
from core.serializers import ProductSerializer

from .filters import ProductModelFilter


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    filterset_class = ProductModelFilter
    serializer_class = ProductSerializer
