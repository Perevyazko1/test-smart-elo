import random

from src.label_printer.config import DOTS_MM, WIDTH_MM, HEIGHT_MM, GAP_MM, LINE_WIDTH
from src.label_printer.commands import get_text_commands_with_sizes, get_qr_command, get_bar_command


def main_label_template(
        main_text_data: list[tuple[str, int]],
        qr_data: str,
        order_data: list[tuple[str, int]],
        department_data: list[tuple[str, int]],
):
    # Формируем плавающий отступ для уменьшения износа печатающей головки
    LINE_OFFSET_MM = random.randint(-3, 3) / DOTS_MM

    # Габарит левого блока
    LEFT_BLOCK = {
        "width_mm": WIDTH_MM * 0.7 + LINE_OFFSET_MM,
        "height_mm": HEIGHT_MM,
    }
    # Габарит правого блока
    RIGHT_BLOCK = {
        "width_mm": WIDTH_MM - LEFT_BLOCK["width_mm"] - GAP_MM,
        "height_mm": HEIGHT_MM,
    }

    Z_DEPARTMENT = {
        "width_mm": LEFT_BLOCK["width_mm"],
        "height_mm": 10,
    }
    Z_MAIN_TEXT = {
        "width_mm": LEFT_BLOCK["width_mm"],
        "height_mm": HEIGHT_MM - Z_DEPARTMENT["height_mm"],
    }
    Z_QR = {
        "width_mm": RIGHT_BLOCK["width_mm"],
        "height_mm": HEIGHT_MM / 2 - GAP_MM,
    }
    Z_ORDER = {
        "width_mm": RIGHT_BLOCK["width_mm"],
        "height_mm": HEIGHT_MM - Z_QR["height_mm"],
    }

    commands = []

    # Формируем блок главного текста
    text_commands, has_more = get_text_commands_with_sizes(
        0,
        GAP_MM,
        main_text_data,
        Z_MAIN_TEXT['width_mm'],
        Z_MAIN_TEXT['height_mm']
    )
    commands.append(text_commands)
    # Если текст не помещается - добавляем предупреждение "!K" на этикетку
    if has_more:
        commands.append(
            get_text_commands_with_sizes(
                Z_MAIN_TEXT['width_mm'] - GAP_MM * 5,
                Z_MAIN_TEXT['height_mm'],
                [["!К", 20]],
                20,
                Z_MAIN_TEXT['height_mm']
            ))

    # Формируем блок текста отдела
    commands.append(
        get_text_commands_with_sizes(
            0,
            Z_MAIN_TEXT['height_mm'] + GAP_MM * 2,
            department_data,
            Z_DEPARTMENT['width_mm'],
            Z_DEPARTMENT['height_mm'],
        )
    )

    # Формируем QR код
    commands.append(
        get_qr_command(
            qr_data,
            Z_MAIN_TEXT['width_mm'],
            GAP_MM,
            Z_QR['width_mm'] * 2
        )
    )

    # Формируем инфо по заказу
    commands.append(
        get_text_commands_with_sizes(
            Z_MAIN_TEXT['width_mm'] - GAP_MM / 3,
            Z_QR['height_mm'] + GAP_MM / 2,
            order_data,
            Z_ORDER['width_mm'],
            Z_ORDER['height_mm']
        )
    )

    # Чертим линии
    commands.append(
        get_bar_command(
            Z_MAIN_TEXT['width_mm'] - GAP_MM,
            0,
            LINE_WIDTH,
            HEIGHT_MM
        )
    )
    commands.append(
        get_bar_command(
            Z_MAIN_TEXT['width_mm'] - GAP_MM,
            Z_QR['height_mm'],
            Z_QR['width_mm'] + GAP_MM,
            LINE_WIDTH
        )
    )

    # Возвращаем список команд
    return commands
