from core.models import ProductPicture, Fabric


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
    pictures = ProductPicture.objects.filter(image__isnull=False)

    for pic in pictures:
        pic.save()

    fabrics = Fabric.objects.filter(image__isnull=False)

    for fabric in fabrics:
        fabric.save()
