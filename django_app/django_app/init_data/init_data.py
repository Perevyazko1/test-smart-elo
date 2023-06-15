from django.db.models import Count

from core.models import Assignment

# departments = {
#     'Старт': [0, False, False],
#     'Конструктора': [1, True, True],
#     'Обивка': [2, False, True],
#     'Пошив': [3, False, True],
#     'ППУ': [4, False, False],
#     'Крой': [5, False, True],
#     'Лазер': [6, False, False],
#     'Сборка': [7, False, True],
#     'Столярка': [8, False, False],
#     'Малярка': [9, False, False],
#     'Упаковка': [10, False, False],
#     'Подрядчики': [11, False, False],
#     'Пила': [12, False, False],
#     'Готово': [50, False, False],
# }
#
# groups = [
#     'Администраторы',
#
#     'Страница ЭЛО',
#     'Визирование нарядов',
#     'Режим просмотра бригадира',
#     'Действия от имени сотрудников отдела',
#
#     'Страница тарификаций',
#     'Первичная тарификация',
#     'Подтверждение тарификаций',
# ]


def init_data():
    """Функция для активации скриптов через вызов url /init"""
    pass
    # # Получим все записи Assignment, которые имеют дубликаты, основанные на 'number', 'order_product', 'department'
    # duplicates = (Assignment.objects.values('number', 'order_product_id', 'department_id')
    #               .annotate(count=Count('id'))
    #               .filter(count__gt=1))
    #
    # # Теперь получим все дублирующие объекты на основе этих значений
    # for duplicate in duplicates:
    #     number = duplicate['number']
    #     order_product_id = duplicate['order_product_id']
    #     department_id = duplicate['department_id']
    #
    #     dup_objects = Assignment.objects.filter(
    #         number=number,
    #         order_product_id=order_product_id,
    #         department_id=department_id,
    #     ).order_by('status')  # Чтобы сначала удалялись 'await', потом 'in_work', затем 'ready'
    #
    #     # Используем [1:], чтобы оставить одну запись (наименьший по статусу) не удаленной
    #     for obj in dup_objects[1:]:
    #         obj.delete()
    #
    # assignment_await_list = Assignment.objects.filter(
    #     department__number=1,
    #     status="await"
    # )
    # assignment_in_work_list = Assignment.objects.filter(
    #     department__number=1,
    #     status="in_work"
    # )
    # assignment_ready_list = Assignment.objects.filter(
    #     department__number=1,
    #     status="ready"
    # )
    #
    # product_id_list = []
    #
    # for assignment in assignment_ready_list:
    #     if assignment.order_product.product.id in product_id_list:
    #         continue
    #     else:
    #         product_id_list.append(assignment.order_product.product.id)
    #
    # for assignment in assignment_in_work_list:
    #     if assignment.order_product.product.id in product_id_list:
    #         assignment.delete()
    #     else:
    #         product_id_list.append(assignment.order_product.product.id)
    #
    # for assignment in assignment_await_list:
    #     if assignment.order_product.product.id in product_id_list:
    #         assignment.delete()
    #     else:
    #         product_id_list.append(assignment.order_product.product.id)

    # for department_name, department_params in departments.items():
    #     Department.objects.update_or_create(
    #         name=department_name,
    #         number=department_params[0],
    #         defaults={
    #             "single": department_params[1],
    #             "piecework_wages": department_params[2]
    #         }
    #     )
    #
    # for group_name in groups:
    #     Group.objects.update_or_create(
    #         name=group_name
    #     )

    # for name, schema in technological_processes.items():
    #     path_to_image_file = os.path.join(os.path.dirname(__file__), 'images', f'{name}.png')
    #     with open(path_to_image_file, 'rb') as f:
    #         tech_process = TechnologicalProcess.objects.update_or_create(
    #             name=name,
    #             defaults={
    #                 "schema": schema
    #             }
    #         )[0]
    #         tech_process.image.delete()
    #         tech_process.image.save(f'{name}.png', File(f), save=True)

    # if not Employee.objects.filter(username='root').exists():
    #     user = Employee.objects.create_superuser(
    #         username='root',
    #         email='c3mk@mail.ru',
    #         password='RLcb!!Dk',
    #     )
    #     user.first_name = 'Администратор'
    #     user.pin_code = 147858
    #     user.save()
    #
    # if not Employee.objects.filter(username='Kharchenko_D').exists():
    #     Employee.objects.create_superuser(
    #         username='Kharchenko_D',
    #         email='lameblas@gmail.com',
    #         password='Dmitriy_852',
    #     )
    #
    # for username, params in employees.items():
    #     user = Employee.objects.filter(username=username)
    #     if user.exists():
    #         user = user[0]
    #         user.set_password(params['password'])
    #         user.first_name = params['first_name']
    #         user.last_name = params['last_name']
    #         user.pin_code = params['pin_code']
    #         user.save()
    #     else:
    #         user = Employee.objects.create(
    #             username=username,
    #             first_name=params['first_name'],
    #             last_name=params['last_name'],
    #             password=params['password'],
    #             pin_code=params['pin_code'],
    #         )
    #
    #     for group_name in params['groups']:
    #         user.groups.add(Group.objects.get(name=group_name))
    #
    #     for department_name in params['departments']:
    #         user.departments.add(Department.objects.get(name=department_name))
