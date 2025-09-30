from typing import List

from src.label_printer.tspl2_commands import get_text_block_command, get_barcode_command, get_box_command


def get_fabric_label_commands(pos_x=0, pos_y=2, width=52, height=28, name='', barcode='') -> List[str]:
    """BLOCK x,y,width,height,"font",rotation,x-multiplication,y-multiplication,space,align,fit,"content" """
    border = get_box_command(pos_x=pos_x, pos_y=pos_y, width=width, height=height)
    text = get_text_block_command(pos_x, pos_y, width, height, name)
    barcode = get_barcode_command(pos_x=0, pos_y=height, barcode=barcode)
    return [border, text, barcode]