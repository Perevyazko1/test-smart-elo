import time
import functools


def log_time(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()  # Начало отсчета времени
        result = func(*args, **kwargs)  # Вызов декорируемой функции
        end_time = time.time()  # Конец отсчета времени
        execution_time = end_time - start_time  # Вычисление времени выполнения

        # Форматирование времени выполнения
        if execution_time > 0.01:
            # Подсветка красным цветом для времени > 0.01
            color_code = "\033[91m"  # Красный
        else:
            # Обычный цвет для времени <= 0.01
            color_code = "\033[0m"  # Обычный цвет

        print(f"Function '{func.__name__}' executed in {color_code}{execution_time:.4f} seconds\033[0m")
        return result

    return wrapper
