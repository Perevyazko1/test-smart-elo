from django.http import JsonResponse
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.filters import OrderingFilter
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .filters import EmployeeModelFilter
from .models import Employee, Department, Audit
from .serializers import EmployeeSerializer, DepartmentSerializer, AuditSerializer, CreateUserSerializer


class CreateUserViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = CreateUserSerializer


class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    filterset_class = EmployeeModelFilter
    serializer_class = EmployeeSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    ordering_fields = ['permanent_department']

    def list(self, request, *args, **kwargs):
        CACHE_KEY_EMPLOYEE_LIST = 'employee_list_cache_key'
        cache_timeout = 60 * 60 * 4  # 2 часа

        # Проверяем кеш
        # cached_data = cache.get(CACHE_KEY_EMPLOYEE_LIST)
        # if cached_data:
        #     print(f'###PRINT list #l=>33: CACHED!!!!')
        #     return JsonResponse(cached_data, safe=False)

        # Если кеш пустой, делаем запрос и сохраняем в кеш
        response = super().list(request, *args, **kwargs)
        # cache.set(CACHE_KEY_EMPLOYEE_LIST, response.data, cache_timeout)

        return response


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all().exclude(
        number__in=[0, 50]
    )
    serializer_class = DepartmentSerializer

    def get_queryset(self):
        return super().get_queryset().filter(
            id__in=self.request.user.departments.all()
        )


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


@api_view(['POST'])
def add_to_favorite(request):
    data = request.data.get('data')

    if not data:
        return Response('Не указан ID пользователя', status=400)

    try:
        user: Employee = request.user
        print(request.user)
        favorite_user = Employee.objects.get(id=data)

        if favorite_user in user.favorite_users.all():
            user.favorite_users.remove(favorite_user)
            action = 'removed'
        else:
            user.favorite_users.add(favorite_user)
            action = 'added'

        serialized_user = EmployeeSerializer(user, context={'request': request}).data
        return Response(serialized_user, status=200)
    except Employee.DoesNotExist:
        return Response('Пользователь не найден', status=400)
    except Exception as e:
        return Response(str(e), status=400)