import os
from typing import Dict, Optional
from PIL import Image, ImageDraw, ImageFont
import qrcode

from src.label_printer.commands import mm_to_dots
from src.label_printer.printer_tspl2 import PrinterTSPL2

# Константы макета
LINE_SPACE = 0
PADDING = 4
DATA_SPACE = 2
LINE_WIDTH_THIN = 2
LINE_WIDTH_THICK = 4

# Размеры этикетки
LABEL_WIDTH_MM = 54
LABEL_HEIGHT_MM = 40


class LabelData:
    """Класс для хранения данных этикетки"""

    def __init__(
            self,
            project: str,
            order_number: str,
            product: str,
            fabrics: list[str],
            qr_data: str,
            inspector_info: str,
            department: str
    ):
        self.project = project
        self.order_number = order_number
        self.product = product
        self.fabrics = fabrics
        self.qr_data = qr_data
        self.inspector_info = inspector_info
        self.department = department


def normalize_text_for_font(text: str) -> str:
    """
    Заменяет символы, которые могут отсутствовать в шрифте, на альтернативные.

    Args:
        text: исходный текст

    Returns:
        str: текст с замененными символами
    """
    replacements = {
        '*': 'x',  # Звездочка -> x (или можно использовать '×' если есть в шрифте)
        '×': 'x',  # Знак умножения
        '•': '-',  # Буллет
        '―': '-',  # Длинное тире
        '–': '-',  # Среднее тире
        '"': '"',  # Типографские кавычки
        ''': "'",
        ''': "'",
    }

    for old_char, new_char in replacements.items():
        text = text.replace(old_char, new_char)

    return text


def wrap_text_native(text: str, font: ImageFont.FreeTypeFont, max_width: int, break_by_char: bool = False) -> str:
    """
    Автоматический перенос текста с учётом ширины.

    Args:
        text: текст для переноса
        font: шрифт
        max_width: максимальная ширина строки в пикселях
        break_by_char: если True, разбивает по символам, иначе по словам

    Returns:
        str: текст с переносами строк (\n)
    """
    if not text:
        return ""

    temp_img = Image.new("1", (1, 1))
    draw = ImageDraw.Draw(temp_img)

    if break_by_char:
        lines = []
        current_line = ""
        for char in text:
            test_line = current_line + char
            if draw.textlength(test_line, font=font) <= max_width:
                current_line = test_line
            else:
                if current_line:
                    lines.append(current_line)
                current_line = char
        if current_line:
            lines.append(current_line)
        return "\n".join(lines)

    # Разбиение по словам
    words = text.split()
    lines = []
    current_line = ""

    for word in words:
        word_width = draw.textlength(word, font=font)

        # Если слово слишком длинное - разбиваем по буквам
        if word_width > max_width:
            if current_line:
                lines.append(current_line)
                current_line = ""

            temp_word = ""
            for char in word:
                test_word = temp_word + char
                if draw.textlength(test_word, font=font) <= max_width:
                    temp_word = test_word
                else:
                    if temp_word:
                        lines.append(temp_word)
                    temp_word = char

            if temp_word:
                current_line = temp_word
        else:
            test_line = current_line + (" " if current_line else "") + word
            if draw.textlength(test_line, font=font) <= max_width:
                current_line = test_line
            else:
                if current_line:
                    lines.append(current_line)
                current_line = word

    if current_line:
        lines.append(current_line)

    return "\n".join(lines)


def draw_text_multiline(
        draw: ImageDraw.ImageDraw,
        text: str,
        font: ImageFont.FreeTypeFont,
        width: int,
        height: int,
        x_offset: int = 0,
        y_offset: int = 0,
        align: str = 'left',
        break_by_char: bool = False
) -> int:
    """
    Рисует многострочный текст с автоматическим переносом.

    Args:
        draw: объект ImageDraw
        text: текст для отрисовки
        font: шрифт
        width: максимальная ширина текстовой области
        height: максимальная высота текстовой области
        x_offset: смещение по X
        y_offset: смещение по Y
        align: выравнивание ('left', 'center', 'right')
        break_by_char: разбивать по символам или словам

    Returns:
        int: реальная высота нарисованного текста
    """
    # Нормализуем текст для шрифта
    text = normalize_text_for_font(text)
    wrapped_text = wrap_text_native(text, font, width, break_by_char)

    bbox = draw.multiline_textbbox((0, 0), wrapped_text, font=font, spacing=LINE_SPACE)
    text_height = bbox[3] - bbox[1]

    if text_height > height:
        lines = wrapped_text.split('\n')
        # Используем реальную высоту строки вместо font.size
        bbox_single = draw.textbbox((0, 0), "Аy", font=font)
        line_height = bbox_single[3] - bbox_single[1]
        max_lines = int(height / (line_height + LINE_SPACE))

        if max_lines > 0 and len(lines) > max_lines:
            # Обрезаем только если строк больше чем max_lines
            lines = lines[:max_lines]
            if len(lines) > 0:
                # Добавляем многоточие, обрезав только 1 символ
                lines[-1] = lines[-1][:-1] + "..." if len(lines[-1]) > 1 else "..."
            wrapped_text = "\n".join(lines)

    draw.multiline_text(
        (x_offset, y_offset),
        wrapped_text,
        font=font,
        fill=0,
        align=align,
        spacing=LINE_SPACE
    )

    # Возвращаем реальную высоту нарисованного текста
    final_bbox = draw.multiline_textbbox((x_offset, y_offset), wrapped_text, font=font, spacing=LINE_SPACE)
    return final_bbox[3] - final_bbox[1]


def get_text_size(font: ImageFont.FreeTypeFont, lines: int) -> int:
    """Рассчитывает высоту текста с учётом количества строк"""
    # Используем реальную высоту строки через bbox вместо font.size
    temp_img = Image.new("1", (1, 1))
    draw = ImageDraw.Draw(temp_img)
    # Измеряем реальную высоту одной строки текста
    bbox = draw.textbbox((0, 0), "Аy", font=font)
    line_height = bbox[3] - bbox[1]
    return int(line_height * lines + LINE_SPACE * (lines - 1))


def create_qr_code(data: str, size: int) -> Image.Image:
    """Создаёт QR-код заданного размера"""
    qr = qrcode.QRCode(version=1, box_size=2)
    qr.add_data(data)
    qr_obj = qr.make_image(fill_color="black", back_color="white")
    return qr_obj.resize((size, size))


def draw_label_layout(
        img: Image.Image,
        draw: ImageDraw.ImageDraw,
        label_data: LabelData,
        fonts: Dict[str, ImageFont.FreeTypeFont],
        label_width: int,
        label_height: int
) -> None:
    """
    Рисует макет этикетки.

    Args:
        img: изображение этикетки
        draw: объект для рисования
        label_data: данные для этикетки
        fonts: словарь шрифтов
        label_width: ширина этикетки в точках
        label_height: высота этикетки в точках
    """
    text_part = int(label_height * 0.73)
    qr_size = int(text_part / 3)
    qr_zone = qr_size + DATA_SPACE

    # Создание и размещение QR-кодов
    qr_img = create_qr_code(label_data.qr_data, qr_size)
    qr_positions = [
        (PADDING, PADDING),
        (label_width - qr_size - PADDING, PADDING),
        (PADDING, text_part + DATA_SPACE),
        (label_width - qr_size - PADDING, text_part + DATA_SPACE)
    ]
    for pos in qr_positions:
        img.paste(qr_img, pos)

    # Вертикальные разделители вокруг QR-кодов
    draw.line([(qr_zone, PADDING), (qr_zone, qr_zone)], fill=0, width=LINE_WIDTH_THICK)
    draw.line([(label_width - qr_zone, PADDING), (label_width - qr_zone, qr_zone)], fill=0, width=LINE_WIDTH_THICK)
    draw.line([(qr_zone, text_part), (qr_zone, label_height - PADDING * 4)], fill=0, width=LINE_WIDTH_THICK)
    draw.line([(label_width - qr_zone, text_part), (label_width - qr_zone, label_height - PADDING * 4)], fill=0,
              width=LINE_WIDTH_THICK)

    # Горизонтальные разделители
    draw.line([(0, qr_zone), (label_width, qr_zone)], fill=0, width=LINE_WIDTH_THICK)
    draw.line([(0, text_part), (label_width, text_part)], fill=0, width=LINE_WIDTH_THICK)

    # Верхняя часть: Проект и номер заказа
    y_offset = 2
    central_width = label_width - qr_zone * 2 - DATA_SPACE * 2

    project_height = get_text_size(fonts['xl'], 1)
    actual_project_height = draw_text_multiline(
        draw=draw, text=label_data.project, font=fonts['xl'],
        width=central_width, height=project_height,
        x_offset=PADDING + qr_zone + DATA_SPACE, y_offset=y_offset,
        break_by_char=True, align='left'
    )
    y_offset += actual_project_height + DATA_SPACE

    order_height = get_text_size(fonts['md'], 2)
    actual_order_height = draw_text_multiline(
        draw=draw, text=label_data.order_number, font=fonts['md'],
        width=central_width, height=order_height,
        x_offset=PADDING + qr_zone + DATA_SPACE, y_offset=y_offset,
        break_by_char=True, align='left'
    )

    # Средняя часть: Продукт и ткани
    y_offset = qr_zone + DATA_SPACE

    product_height = get_text_size(fonts['md'], 3)
    actual_product_height = draw_text_multiline(
        draw=draw, text=label_data.product, font=fonts['md'],
        width=label_width - PADDING * 2, height=product_height,
        x_offset=PADDING, y_offset=y_offset,
        break_by_char=True, align='left'
    )
    y_offset += actual_product_height + DATA_SPACE
    draw.line([(0, y_offset), (label_width, y_offset)], fill=0, width=LINE_WIDTH_THIN)

    # Ткани
    fabric_height = get_text_size(fonts['md'], 1)
    for i, fabric in enumerate(label_data.fabrics):
        draw_text_multiline(
            draw=draw, text=fabric, font=fonts['md'],
            width=label_width - PADDING * 2, height=fabric_height,
            x_offset=PADDING, y_offset=y_offset,
            break_by_char=True, align='left'
        )
        y_offset += fabric_height + DATA_SPACE
        if i < len(label_data.fabrics) - 1:
            draw.line([(0, y_offset + DATA_SPACE), (label_width, y_offset + DATA_SPACE)], fill=0, width=LINE_WIDTH_THIN)

    # Нижняя часть: Информация об инспекторе и отделе
    y_offset = text_part + DATA_SPACE
    info_height = get_text_size(fonts['md'], 1)

    draw_text_multiline(
        draw=draw, text=label_data.inspector_info, font=fonts['md'],
        width=label_width - PADDING * 2 - qr_size * 2 - DATA_SPACE * 2,
        height=info_height,
        x_offset=PADDING + qr_zone + DATA_SPACE, y_offset=y_offset,
        break_by_char=True, align='center'
    )

    y_offset += info_height + DATA_SPACE
    draw_text_multiline(
        draw=draw, text=label_data.department, font=fonts['md'],
        width=label_width - PADDING * 2 - qr_size * 2 - DATA_SPACE * 2,
        height=info_height,
        x_offset=PADDING + qr_zone + DATA_SPACE, y_offset=y_offset,
        break_by_char=True, align='center'
    )


def print_assignment_label(label_data: LabelData, font_path: Optional[str] = None, target_ip: str = "") -> None:
    """
    Печатает этикетку с заданными данными.

    Args:
        label_data: объект с данными для печати
        font_path: путь к файлу шрифта (опционально)
        target_ip: адрес принтера в сети
    """
    label_width = mm_to_dots(LABEL_WIDTH_MM)
    label_height = mm_to_dots(LABEL_HEIGHT_MM)

    if font_path is None:
        font_path = os.path.join(os.path.dirname(__file__), "LabelFont.ttf")

    # Проверка существования файла шрифта
    if not os.path.exists(font_path):
        raise FileNotFoundError(f"Font file not found at: {font_path}")

    if not os.path.isfile(font_path):
        raise ValueError(f"Font path is not a file: {font_path}")

    # Проверка прав доступа
    if not os.access(font_path, os.R_OK):
        raise PermissionError(f"No read permission for font file: {font_path}")

    # Загрузка шрифтов
    try:
        fonts = {
            'xl': ImageFont.truetype(font_path, 28),
            'md': ImageFont.truetype(font_path, 24),
        }
    except Exception as e:
        raise RuntimeError(f"Failed to load font from {font_path}: {str(e)}") from e

    # Создание изображения
    img = Image.new("1", (label_width, label_height), 1)
    draw = ImageDraw.Draw(img)

    # Рисование макета
    draw_label_layout(img, draw, label_data, fonts, label_width, label_height)

    # Сохранение в BMP
    img = img.convert("1")

    # Отправка на принтер
    raw_data = img.tobytes()
    printer = PrinterTSPL2(ip=target_ip)
    
    try:
        printer.connect(timeout=10.0)

        # Подготовка команд
        commands = [
            f"SIZE {LABEL_WIDTH_MM} mm,{LABEL_HEIGHT_MM} mm",
            "REFERENCE 0,0",
            "DIRECTION 0",
            "CLS"
        ]
        
        # Отправляем основные команды настройки одним пакетом
        printer.send_command("\r\n".join(commands))

        # Отправка битмапа
        width_in_bytes = label_width // 8
        header = f"BITMAP 0,0,{width_in_bytes},{label_height},0,".encode('ascii')
        # Важно: после сырых данных BITMAP часто требуется \r\n для корректного завершения команды в TSPL2
        printer.send_raw(header + raw_data + b"\r\n")

        # Печать
        printer.send_command("PRINT 1")
    except Exception as e:
        raise RuntimeError(f"Printer error: {str(e)}") from e
    finally:
        printer.disconnect()


# Пример использования
if __name__ == "__main__":
    example_data = LabelData(
        project="Серийная мебель",
        order_number="11-33481 №15",
        product='Евро-диван / "Манчестер" / База / (сп.м. 1500*1900)',
        fabrics=[
            'Т1: Ткань "Sensey" (35, Mineral Blue)',
            'Т2: Ткань "Sensey" (35, Mineral Blue)',
            'Т3: Ткань "Sensey" (35, Mineral Blue)',
        ],
        qr_data="2012345678901",
        inspector_info="ОКК:ПМВ 13.11.25",
        department="ОБИВКА"
    )

    print_assignment_label(example_data)