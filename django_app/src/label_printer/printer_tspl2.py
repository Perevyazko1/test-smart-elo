import socket

from src.label_printer.config import PRINTER_TSPL2_IP, PRINTER_PORT


# ---------- КЛАСС ПРИНТЕРА ----------
class PrinterTSPL2:
    """TSPL2 PROTOCOL PRINTER"""

    def __init__(self, ip: str = PRINTER_TSPL2_IP, port: int = PRINTER_PORT):
        self.ip = ip
        self.port = port
        self.socket: socket.socket | None = None

    def connect(self):
        if not self.socket:
            self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self.socket.connect((self.ip, self.port))

    def disconnect(self):
        if self.socket:
            self.socket.close()
            self.socket = None

    def send_command(self, command: str):
        """Отправка текстовой команды (с \r\n)"""
        if not self.socket:
            self.connect()
        data = f"{command}\r\n".encode("ascii")
        self.socket.send(data)

    def send_raw(self, data: bytes):
        """Отправка сырых байтов (для BMP, PCX и т.п.)"""
        if not self.socket:
            self.connect()
        self.socket.send(data)

    def download_file(self, filename: str, data: bytes):
        """Загрузка файла в память принтера"""
        self.send_command(f"DOWNLOAD F,\"{filename}\",{len(data)}")
        self.send_raw(data)

    def print_label(self, commands: list[str], width_mm=58, height_mm=40, copies=1):
        """Формирование и печать этикетки"""
        try:
            self.connect()

            # Настройка страницы
            self.send_command(f"SIZE {width_mm} mm,{height_mm} mm")
            self.send_command("GAP 3 mm,0 mm")
            self.send_command("REFERENCE 0,0")
            self.send_command("DIRECTION 0")

            # Очистка буфера
            self.send_command("CLS")

            # Отправляем все команды печати
            for cmd in commands:
                self.send_command(cmd)

            # Печать
            self.send_command(f"PRINT {copies}")

        finally:
            self.disconnect()