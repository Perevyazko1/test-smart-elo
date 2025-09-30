"""Initial methods and scripts."""
import logging
from pprint import pprint

from core.models import TechnologicalProcess
from staff.models import Department

logger = logging.getLogger(__name__)


def get_target_department_name(schema: dict):
    for key, value in schema.items():
        if key == 'Обивка' or "Обивка" in value:
            return 'Обивка'

    for key, value in schema.items():
        if "Упаковка" in value:
            return key

    for key, value in schema.items():
        if "Готово" in value:
            return key

    pprint(schema)
    raise Exception("Схема не корректна")


def init_data():
    """Функция для активации скриптов через вызов url /init"""
    print('ИНИЦИАЛИЗАЦИЯ ФУНКЦИИ')

    tech_processes = TechnologicalProcess.objects.all()

    for tech_process in tech_processes:
        print(f"Технологический процесс: {tech_process.name}")

        schema = tech_process.schema

        department_name = get_target_department_name(schema)

        print(department_name)

        tech_process.final_department = Department.objects.get(name=department_name)

        tech_process.save()

    print('PASS')
    return f"Oki"
