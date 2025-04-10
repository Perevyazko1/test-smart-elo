import {EqOrderProduct} from "@widgets/EqCardList";

export const groupByPlanDate = (data: EqOrderProduct[]): EqOrderProduct[] => {
    // 1. Собираем все assignments с привязкой к родительскому EqOrderProduct
    const allAssignments = data.flatMap(item =>
        item.assignments.map(assignment => ({
            parentItem: item,
            assignment,
            sortKey: assignment.plane_date ? new Date(assignment.plane_date).getTime() : null
        }))
    );

    // 2. Сортируем все assignments по sortKey (plane_date)
    allAssignments.sort((a, b) => {
        if (a.sortKey !== null && b.sortKey !== null) {
            return a.sortKey - b.sortKey;
        }
        if (a.sortKey === null && b.sortKey !== null) return 1;
        if (a.sortKey !== null && b.sortKey === null) return -1;
        return 0;
    });

    // 3. Группируем по комбинации itemId и plane_date
    const resultMap = new Map<string, EqOrderProduct>();
    allAssignments.forEach(({ parentItem, assignment }) => {
        // Создаём уникальный ключ: id изделия + plane_date (или "no_date" если даты нет)
        const dateKey = assignment.plane_date || "no_date";
        const uniqueKey = `${parentItem.id}-${dateKey}`;

        if (!resultMap.has(uniqueKey)) {
            // Создаём новый EqOrderProduct для этой комбинации id + plane_date
            resultMap.set(uniqueKey, {
                ...parentItem,
                assignments: [],
                plane_date: assignment.plane_date // Обновляем plane_date для группы
            });
        }
        // Добавляем assignment в соответствующий EqOrderProduct
        resultMap.get(uniqueKey)!.assignments.push(assignment);
    });

    // 4. Преобразуем Map в массив и возвращаем
    return Array.from(resultMap.values());
};