def check_schema(data):
    start_department = "Старт"
    end_department = "Готово"

    if not data.get(start_department):
        return False

    visited = set()  # Множество посещенных отделов

    def dfs(department_data):
        visited.add(department_data)
        if department_data == end_department:
            return True
        for next_department in data.get(department_data):
            if next_department not in visited:
                if not dfs(next_department):
                    return False
        return True

    # Проверка связей между отделами
    if not dfs(start_department):
        return False

    # Проверка наличия разрывов цепочки отделов
    for department in data:
        if department not in visited:
            return False

    return True


valid_data = {
    "ППУ": ["Обивка"],
    "Крой": ["Пошив"],
    "Лазер": ["Сборка"],
    "Пошив": ["Обивка"],
    "Старт": ["Лазер", "Крой", "ППУ"],
    "Обивка": ["Упаковка"],
    "Сборка": ["Обивка"],
    "Упаковка": ["Готово"]
}

invalid_data = {
    "ППУ": ["Обивка"],
    "Крой": ["Пошив"],
    "Лазер": ["Сборка"],
    "Пошив": ["Обивка"],
    "Старт": ["Лазер", "ППУ", "Обивка"],
    "Обивка": ["Упаковка"],
    "Сборка": ["Обивка"],
    "Упаковка": ["Готово"]
}

if __name__ == '__main__':
    print(check_schema(valid_data))
    print(check_schema(invalid_data))
