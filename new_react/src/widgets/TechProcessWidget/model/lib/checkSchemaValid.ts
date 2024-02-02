import {TechProcessSchema} from "@entities/TechProcess";

export function checkSchemaValid(data: TechProcessSchema) {
    const startDepartment = "Старт";
    const endDepartment = "Готово";

    if (!data[startDepartment]) {
        return false;
    }

    const visited = new Set(); // Множество посещенных отделов

    function dfs(departmentData: string) {
        visited.add(departmentData);
        if (departmentData === endDepartment) {
            return true;
        }
        if(!data[departmentData]) {
            return false;
        }
        for (let nextDepartment of data[departmentData]) {
            if (!visited.has(nextDepartment)) {
                if (!dfs(nextDepartment)) {
                    return false;
                }
            }
        }
        return true;
    }

    // Проверка связей между отделами
    if (!dfs(startDepartment)) {
        return false;
    }

    // Проверка наличия разрывов цепочки отделов
    for (let department in data) {
        if (!visited.has(department)) {
            return false;
        }
    }

    return true;
}