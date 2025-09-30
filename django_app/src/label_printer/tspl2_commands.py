import re

from src.label_printer.commands import mm_to_dots


def escape_tspl2(text: str) -> str:
    """
    Экранирует строку для TSPL2:
    - удваивает кавычки (") → ("")
    - убирает управляющие символы (tab, \n, \r, \x00..)
    - заменяет потенциально проблемные символы
    """
    if not text:
        return ""

    # 1. Удвоение кавычек (по мануалу TSPL2)
    text = text.replace('"', "'")
    text = text.replace("'", '')

    # 2. Убираем управляющие символы (0x00–0x1F кроме пробела)
    text = re.sub(r"[\x00-\x1F]", "", text)

    # 3. (Опционально) заменяем символы, которые иногда ломают синтаксис
    # например, перевод строки, табуляция и т.п.
    text = text.replace("\t", " ")   # таб → пробел
    text = text.replace("\n", " ")   # перенос строки → пробел
    text = text.replace("\r", "")    # возврат каретки → убираем

    # Заменяем другие потенциально проблемные символы на пробелы
    text = re.sub(r'[\\,()\[\]{}]', '*', text)

    return text.strip()


def get_text_block_command(
        pos_x, pos_y, width, height, name,
):
    safe_name = escape_tspl2(name)
    text = (
        f'BLOCK '
        f'{mm_to_dots(pos_x + 1)},'  # pos_x
        f'{mm_to_dots(pos_y + 1)},'  # pos_y
        f'{mm_to_dots(width - 1)},'  # width
        f'{mm_to_dots(height - 1)},'  # height
        f' "2",'  # font (2 гуд)
        f'0,'  # rotation 0-270
        f'2,'  # x-multiplication 1~10
        f'2,'  # y-multiplication 1~10
        f'"{safe_name}"' # data
    )

    return text


def get_barcode_command(pos_x, pos_y, width=2, height=40, barcode=""):
    safe_barcode  = escape_tspl2(barcode)
    return f'BARCODE {mm_to_dots(pos_x)},{mm_to_dots(pos_y)}, "128",{height},{width},0,3,2, "{safe_barcode}"'


def get_box_command(pos_x, pos_y, width, height):
    return f"BOX {mm_to_dots(pos_x)},{mm_to_dots(pos_y)},{mm_to_dots(width)},{mm_to_dots(height)},3"

