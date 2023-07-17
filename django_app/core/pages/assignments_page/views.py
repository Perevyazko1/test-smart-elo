from django.http import JsonResponse
from rest_framework import viewsets
from rest_framework.decorators import api_view

from core.models import Assignment
from .filters import AssignmentModelFilter
from .serializers import AssignmentExtendedSerializer


class AssignmentViewSet(viewsets.ModelViewSet):
    queryset = Assignment.objects.all()
    filterset_class = AssignmentModelFilter
    serializer_class = AssignmentExtendedSerializer


@api_view(['POST'])
def update_assignments(request):
    assignments_id: list[int] = request.data.get('id_list')
    print(assignments_id)
    return JsonResponse({'result': 'ok'}, json_dumps_params={"ensure_ascii": False})
