"""Initial methods and scripts."""
import logging
import os

from PIL import ImageFont, Image, ImageDraw

from src.label_printer.commands import mm_to_dots
from src.label_printer.printer_tspl2 import PrinterTSPL2
from src.label_printer.tspl2_commands import get_barcode_command

logger = logging.getLogger(__name__)


def init_data():
    """Функция для активации скриптов через вызов url /init"""
    print('ИНИЦИАЛИЗАЦИЯ ФУНКЦИИ')

    LABEL_WIDTH = mm_to_dots(58)  # точки
    LABEL_HEIGHT = mm_to_dots(40)  # точки

    # путь к шрифту (лучше положить в проект, поддержка кириллицы обязательна)
    FONT_PATH = os.path.join(os.path.dirname(__file__), "LabelFont.ttf")
    FONT_BIG = ImageFont.truetype(FONT_PATH, 32)

    # создаём картинку
    img = Image.new("1", (LABEL_WIDTH, LABEL_HEIGHT), 1)  # 1-бит, фон белый
    draw = ImageDraw.Draw(img)
    draw.text((10, 10), "Привет, мир!", font=FONT_BIG, fill=0)

    bmp_path = os.path.join(os.path.dirname(__file__), "label.bmp")
    img = img.convert("1") # чёрно-белый 1-бит
    img.save(bmp_path, "BMP")

    raw_data = img.tobytes()

    # печатаем
    printer = PrinterTSPL2()
    printer.connect()

    # Настройка страницы
    printer.send_command(f"SIZE {58} mm,{40} mm")
    printer.send_command("GAP 3 mm,0 mm")
    printer.send_command("REFERENCE 0,0")
    printer.send_command("DIRECTION 0")

    # Очистка буфера
    printer.send_command("CLS")

    # Команда BITMAP требует указания ширины в байтах, а не в пикселях.
    width_in_bytes = (LABEL_WIDTH + 7) // 8
    x = 0
    y = 0

    # Команда BITMAP и данные изображения должны отправляться вместе,
    # а в конце строки команды должна стоять запятая.
    command = f"BITMAP {x},{y},{width_in_bytes},{LABEL_HEIGHT},0,".encode('ascii')
    printer.send_raw(command + raw_data)

    printer.send_command(f"PRINT {1}")
    printer.disconnect()

    print("Этикетка отправлена на печать ✅")

    print('PASS')
    return f"Oki"
