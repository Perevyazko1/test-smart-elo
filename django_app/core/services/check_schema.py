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


def compare_schemas(old_schema, new_schema):
    added_branches = {}
    removed_branches = {}

    # Проверяем добавленные ветки
    for dept, next_depts in new_schema.items():
        if dept not in old_schema:
            added_branches[dept] = next_depts
        else:
            # Проверяем новые связи для существующих отделов
            added = [d for d in next_depts if d not in old_schema.get(dept, [])]
            if added:
                added_branches[dept] = added

    # Проверяем удаленные ветки
    for dept, next_depts in old_schema.items():
        if dept not in new_schema:
            removed_branches[dept] = next_depts
        else:
            # Проверяем удаленные связи для существующих отделов
            removed = [d for d in next_depts if d not in new_schema.get(dept, [])]
            if removed:
                removed_branches[dept] = removed

    return {
        'added': added_branches,
        'removed': removed_branches
    }


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
