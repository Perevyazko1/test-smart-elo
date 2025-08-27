from src.label_printer.config import DOTS_MM


def mm_to_dots(mm, dpi=DOTS_MM):
    """Перевод мм в пиксели. """
    return int(mm * dpi)


def get_bar_command(margin_left_mm, margin_top_mm, width_mm, height_mm):
    """Рисование прямоугольников. """
    return (
        f"BAR {mm_to_dots(margin_left_mm)}, {mm_to_dots(margin_top_mm)},"
        f" {mm_to_dots(width_mm)}, {mm_to_dots(height_mm)}"
    )


def get_qr_command(barcode_data, margin_left_mm, margin_top_mm, size_mm):
    """Формирование команды печати QR кода. """
    return (
        f'QRCODE {mm_to_dots(margin_left_mm)},'
        f'{mm_to_dots(margin_top_mm)},L,{int(size_mm // DOTS_MM)},A,0,"{barcode_data}"'
    )


def get_text_command(text, margin_left_mm, margin_top_mm, font_width, font_height):
    """Формирование команды печати текста. """
    return (
        f'TEXT {mm_to_dots(margin_left_mm)},{mm_to_dots(margin_top_mm)}'
        f',"0",0,{font_width},{font_height},0,"{text}"'
    )


def get_wrap_text_with_sizes(text_size_pairs, with_area_mm):
    """
    Разбивает текст на строки с учетом ширины зоны и разных размеров шрифта

    Args:
        text_size_pairs: Массив пар [текст, размер_шрифта]
        with_area_mm: Ширина области в мм

    Returns:
        Массив строк с размерами шрифтов [[текст, размер_шрифта], ...]
    """
    result = []

    for text_pair in text_size_pairs:
        text = text_pair[0]
        font_width_mm = text_pair[1] / DOTS_MM  # Преобразуем размер шрифта в мм

        # Разбить текст на строки с учетом данного размера шрифта
        chars_per_line = int(with_area_mm // (font_width_mm * 1.5))
        current_line = []
        current_length = 0

        for char in text:
            if current_length + 1 <= chars_per_line:
                current_line.append(char)
                current_length += 1
            else:
                if current_line:
                    result.append([''.join(current_line), text_pair[1]])
                if char != ' ':
                    current_line = [char]
                    current_length = 1
                else:
                    current_line = []
                    current_length = 0

        if current_line:
            result.append([''.join(current_line), text_pair[1]])

    return result


def get_text_commands_with_sizes(margin_left_mm, margin_top_mm, text_size_pairs, width_area_mm, max_height_mm):
    """
    Создает команды для печати текста с разными размерами шрифта с ограничением по высоте

    Args:
        margin_left_mm: Отступ слева в мм
        margin_top_mm: Отступ сверху в мм
        text_size_pairs: Массив пар [текст, размер_шрифта]
        width_area_mm: Ширина области в мм
        max_height_mm: Максимальная высота области в мм

    Returns:
        Массив команд для печати и флаг, показывающий, поместился ли весь текст
    """
    commands = []
    formatted_text_pairs = get_wrap_text_with_sizes(text_size_pairs, width_area_mm)

    current_y = margin_top_mm
    has_more = False

    for text_pair in formatted_text_pairs:
        text = text_pair[0]
        font_size = text_pair[1]
        font_width = font_size
        font_height = font_size

        # Высота этой строки с учетом межстрочного интервала
        line_height = font_height * 2.5 / DOTS_MM

        # Проверяем, поместится ли эта строка в ограничение по высоте
        if current_y + line_height > margin_top_mm + max_height_mm:
            has_more = True
            break

        # Добавляем команду для этой строки
        commands.append(
            get_text_command(
                text,
                margin_left_mm,
                current_y,
                font_width,
                font_height
            )
        )

        # Увеличиваем вертикальную позицию для следующей строки
        current_y += line_height

    return commands, has_more
