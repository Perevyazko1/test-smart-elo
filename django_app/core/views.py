from django.shortcuts import redirect


def import_orders(request):
    # TODO Добавить импорт заказов
    return redirect(request.META.get('HTTP_REFERER'))
