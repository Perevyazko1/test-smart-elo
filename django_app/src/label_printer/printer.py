import socket
from time import sleep

from src.label_printer.config import PRINTER_IP, PRINTER_PORT, WIDTH_MM, HEIGHT_MM, GAP_MM


class Printer:
    """TSPL PROTOCOL PRINTER"""
    def __init__(self, ip=PRINTER_IP, port=PRINTER_PORT):
        self.ip = ip
        self.port = port
        self.socket = None

    def connect(self):
        self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.socket.connect((self.ip, self.port))

    def disconnect(self):
        if self.socket:
            self.socket.close()

    def send_command(self, command):
        if not self.socket:
            self.connect()
        self.socket.send(f"{command}\r\n".encode('utf-8'))

    def print_label(self, commands: list[str], copies=1):
        try:
            self.connect()

            # Настройка страницы
            self.send_command(f"SIZE {WIDTH_MM} mm,{HEIGHT_MM} mm")
            # self.send_command(f"GAP {GAP_MM} mm,0 mm")
            self.send_command("CODEPAGE UTF-8")
            self.send_command("DIRECTION 1")

            # Очистка буфера
            self.send_command("CLS")

            # Отправляем все команды печати
            for cmd in commands:
                self.send_command(cmd)

            # Печать этикеток
            self.send_command(f"PRINT 1,{copies}")

        finally:
            self.disconnect()
