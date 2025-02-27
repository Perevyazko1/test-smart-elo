"""Initial methods and scripts."""
import openpyxl

from core.models import Product, ProductionStep


def get_tariff_report():
    # Создаем новую книгу Excel
    workbook = openpyxl.Workbook()
    sheet = workbook.active
    sheet.title = "Price Report"

    departments = [
        "Крой",
        "Пошив",
        "Столярка",
        "Малярка",
        "Сборка",
        "Обивка",
    ]

    # Заголовки столбцов
    sheet.append([
        "Изделие",
        *departments
    ])

    product_list = Product.objects.all()

    for product in product_list:
        result = [product.name]

        for department_name in departments:
            target_ps = ProductionStep.objects.filter(
                product=product,
                department__name=department_name
            ).first()
            if target_ps:
                result.append(
                    getattr(target_ps.confirmed_tariff, "amount", "N/A")
                )
            else:
                result.append("N/A")
        sheet.append(result)

    # Сохраняем Excel-файл
    file_name = "tariff_report.xlsx"
    workbook.save(file_name)
    print(f"Отчет сохранен в файл: {file_name}")

    return f"Отчет сохранен в файл: {file_name}"
