from django.http import JsonResponse
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Employee, Department, Transaction
from .serializers import EmployeeSerializer, DepartmentSerializer, TransactionSerializer


class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer


class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer


@api_view(['POST'])
def pin_code_authentication(request):
    pin_code = request.data.get('pin_code')
    print(request.data)

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
