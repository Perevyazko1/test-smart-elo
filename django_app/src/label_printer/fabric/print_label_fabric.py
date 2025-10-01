import os

from PIL import ImageFont, Image, ImageDraw

import barcode
from barcode.writer import ImageWriter

from src.label_printer.commands import mm_to_dots
from src.label_printer.printer_tspl2 import PrinterTSPL2


def wrap_text(draw, text, font, max_width):
    """
    Функция для автоматического переноса текста по словам,
    основываясь на его фактической ширине в пикселях.
    """
    lines = []
    if not text:
        return lines

    words = text.split()
    if not words:
        return []

    current_line = ""
    for word in words:
        # Проверяем длину одного слова
        if draw.textlength(word, font=font) > max_width:
            # Разбиваем длинное слово на части
            temp_word = ""
            for char in word:
                if draw.textlength(temp_word + char, font=font) <= max_width:
                    temp_word += char
                else:
                    if temp_word:
                        lines.append(temp_word)
                    temp_word = char
            if temp_word:
                current_line = temp_word
        else:
            # Обычная обработка слов
            test_line = current_line + (" " if current_line else "") + word
            if draw.textlength(test_line, font=font) <= max_width:
                current_line = test_line
            else:
                if current_line:
                    lines.append(current_line)
                current_line = word

    if current_line:
        lines.append(current_line)
    return lines


def print_label_fabric(name: str, code: str):
    LABEL_WIDTH = mm_to_dots(54)  # точки
    LABEL_HEIGHT = mm_to_dots(36)  # точки

    TEXT_PART = int(LABEL_HEIGHT * 0.6)
    BARCODE_PART = LABEL_HEIGHT - TEXT_PART

    # путь к шрифту (лучше положить в проект, поддержка кириллицы обязательна)
    FONT_PATH = os.path.join(os.path.dirname(__file__), "LabelFont.ttf")
    FONT_BIG = ImageFont.truetype(FONT_PATH, 32)

    # создаём картинку
    img = Image.new("1", (LABEL_WIDTH, LABEL_HEIGHT), 1)  # 1-бит, фон белый
    draw = ImageDraw.Draw(img)

    # --- ТЕКСТ ---
    lines = wrap_text(draw, name.replace(" ", ""), FONT_BIG, LABEL_WIDTH)
    total_height = FONT_BIG.size * len(lines)
    y_offset = (TEXT_PART - total_height) // 2

    for i, line in enumerate(lines):
        tw = draw.textlength(line, font=FONT_BIG)
        y = y_offset + i * FONT_BIG.size
        draw.text(((LABEL_WIDTH - tw) // 2, y), line, fill=0, font=FONT_BIG)

    # --- ШТРИХКОД ---
    ean = barcode.get_barcode_class("code128")  # получаем класс
    ean_obj = ean(code, writer=ImageWriter())  # создаём объект
    barcode_img = ean_obj.render(writer_options={"text_distance": 5})

    # Вставляем штрихкод вниз
    barcode_img = barcode_img.resize((LABEL_WIDTH, BARCODE_PART))
    img.paste(barcode_img, (0, TEXT_PART))

    bmp_path = os.path.join(os.path.dirname(__file__), "label.bmp")
    img = img.convert("1") # чёрно-белый 1-бит
    img.save(bmp_path)

    raw_data = img.tobytes()

    # печатаем
    printer = PrinterTSPL2()
    printer.connect()

    # Настройка страницы
    printer.send_command(f"SIZE {58} mm,{40} mm")
    printer.send_command("REFERENCE 0,0")
    printer.send_command("DIRECTION 0")

    # Очистка буфера
    printer.send_command("CLS")

    # Команда BITMAP требует указания ширины в байтах, а не в пикселях.
    width_in_bytes = LABEL_WIDTH // 8
    x = 0
    y = 0

    # Команда BITMAP и данные изображения должны отправляться вместе,
    # а в конце строки команды должна стоять запятая.
    command = f"BITMAP {x},{y},{width_in_bytes},{LABEL_HEIGHT},0,".encode('ascii')
    printer.send_raw(command + raw_data)

    printer.send_command(f"PRINT {1}")
    printer.disconnect()

    print("Этикетка отправлена на печать ✅")
