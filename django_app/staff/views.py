from django.http import JsonResponse
from rest_framework import viewsets
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import Employee, Department, Audit
from .serializers import EmployeeSerializer, DepartmentSerializer, AuditSerializer


class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer


@api_view(['POST'])
@permission_classes([AllowAny])
def pin_code_authentication(request):
    pin_code = request.data.get('pin_code')

    try:
        user = Employee.objects.get(pin_code=pin_code)
        serialized_user = EmployeeSerializer(user, context={'request': request})
        return JsonResponse(serialized_user.data)
    except:
        return Response('Пользователь не найден', status=401)


@api_view(['POST'])
@permission_classes([AllowAny])
def base_authentication(request):
    try:
        serialized_user = EmployeeSerializer(request.user, context={'request': request})
        return JsonResponse(serialized_user.data)
    except:
        return Response('Пользователь не найден', status=401)


@api_view(['POST'])
def change_current_department(request):
    department_number = request.data.get('department_number')

    try:
        user = request.user
        user.current_department = Department.objects.get(number=department_number)
        user.save()
        serialized_user = EmployeeSerializer(user, context={'request': request})
        return JsonResponse(serialized_user.data)
    except:
        return Response('Пользователь не найден', status=401)


@api_view(['GET'])
def get_audit_list(request):
    audit_list = Audit.objects.filter(employee=request.user).order_by('-date')[:100]
    data = AuditSerializer(audit_list, many=True).data
    return JsonResponse({'data': data}, json_dumps_params={"ensure_ascii": False})
