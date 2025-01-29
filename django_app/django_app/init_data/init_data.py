"""Initial methods and scripts."""


def init_data():
    """Функция для активации скриптов через вызов url /init"""
    print('ИНИЦИАЛИЗАЦИЯ ФУНКЦИИ')
#
#     # Создаем новую книгу Excel
#     workbook = openpyxl.Workbook()
#     sheet = workbook.active
#     sheet.title = "Assignments Report"
#
#     # Заголовки столбцов
#     sheet.append([
#         "Проект",
#         "№ заказа",
#         "ID серии производства",
#         "Наименование товара",
#         "Количество",
#         "Цена продажи",
#         "Всего нарядов",
#         "Выполнено нарядов",
#         "% не готово",
#         "Задолженность",
#     ])
#
#     # Получаем данные
#     target_orders = Order.objects.filter(
#         order_products__status="0"
#     ).distinct()
#
#     target_order_products = OrderProduct.objects.filter(
#         order__in=target_orders
#     ).distinct()
#
#     for order_product in target_order_products:
#         target_assignments = Assignment.objects.filter(
#             order_product=order_product
#         ).distinct()
#
#         series_id = order_product.series_id
#         total_assignments = target_assignments.count()
#         ready_assignments = target_assignments.filter(status="ready").count()
#         percent_debit = float(get_debit(total_assignments, ready_assignments))
#
#         # Если percent_debit равен 0, задолженность становится 0
#         debit = (float(0) if percent_debit == 0 else float(order_product.price) / 100 * percent_debit) * order_product.quantity
#
#         # Добавляем строку в Excel
#         sheet.append([
#             getattr(order_product.order, "project", "N/A"),  # Проверка существования атрибута
#             order_product.order.number,
#             series_id,
#             order_product.product.name,
#             order_product.quantity,
#             float(order_product.price),  # Преобразуем Decimal в float для читаемости
#             total_assignments,
#             ready_assignments,
#             round(float(percent_debit), 2),  # Округляем процент до 2 знаков
#             round(float(debit), 2),  # Округляем задолженность до 2 знаков
#         ])
#
#     # Сохраняем Excel-файл
#     file_name = "assignments_report.xlsx"
#     workbook.save(file_name)
#     print(f"Отчет сохранен в файл: {file_name}")
#
#     return f"Отчет сохранен в файл: {file_name}"
#
#
# def get_debit(total_count: float, ready_count: float) -> float:
#     """Расчет процента выполнения."""
#     percent_ready = 0
#     if total_count and not total_count == 1:
#         percent_ready = ready_count / total_count * 100
#     return 100 - percent_ready
