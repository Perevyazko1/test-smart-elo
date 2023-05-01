#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys


def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_app.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc

    if len(sys.argv) > 1 and sys.argv[1] == 'runserver':
        # получаем IP-адрес и порт из переменных окружения
        ip_address = os.environ.get('SERVER_IP_ADDRESS', '127.0.0.1')
        port = os.environ.get('SERVER_PORT', '8000')

        # формируем строку с адресом и портом
        address = f'{ip_address}:{port}'

        execute_from_command_line(['manage.py', 'runserver', address])

    else:
        execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
