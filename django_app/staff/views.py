from django.http import JsonResponse
from rest_framework import viewsets
from rest_framework.decorators import api_view
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
def pin_code_authentication(request):
    pin_code = request.data.get('pin_code')

    try:
        user = Employee.objects.get(pin_code=pin_code)
        serialized_user = EmployeeSerializer(user, context={'request': request})
        return JsonResponse(serialized_user.data)
    except:
        return Response('Пользователь не найден', status=401)


@api_view(['POST'])
def change_current_department(request):
    pin_code = request.data.get('pin_code')
    department_number = request.data.get('department_number')

    try:
        user = Employee.objects.get(pin_code=pin_code)
        user.current_department = Department.objects.get(number=department_number)
        user.save()
        serialized_user = EmployeeSerializer(user, context={'request': request})
        return JsonResponse(serialized_user.data)
    except:
        return Response('Пользователь не найден', status=401)


@api_view(['GET'])
def get_audit_list(request):
    pin_code = request.query_params.get('pin_code')
    audit_list = Audit.objects.filter(employee__pin_code=pin_code).order_by('-date')[:100]
    data = AuditSerializer(audit_list, many=True).data
    return JsonResponse({'data': data}, json_dumps_params={"ensure_ascii": False})
