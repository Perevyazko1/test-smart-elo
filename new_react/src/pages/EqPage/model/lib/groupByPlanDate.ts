import {EqAssignment, EqOrderProduct} from "@widgets/EqCardList";

export const groupByPlanDate = (data: EqOrderProduct[]): EqOrderProduct[] => {
    const result: (EqOrderProduct & { sortKey?: number | null })[] = [];

    data.forEach(item => {
        // Группируем наряды по planDate (используем правильное имя свойства)
        const groups = item.assignments.reduce((acc, curr) => {
            const key = curr.plane_date ? new Date(curr.plane_date).getDate() : "no_date";
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(curr);
            return acc;
        }, {} as { [key: string]: EqAssignment[] });

        // Формируем временный массив, добавляя sortKey
        Object.keys(groups).forEach(key => {
            result.push({
                ...item,
                assignments: groups[key],
                sortKey: key === "no_date" ? null : new Date(key).getTime()
            });
        });
    });

    // Сортировка: сначала карточки без даты (sortKey === null), затем по возрастанию даты
    result.sort((a, b) => {
        if (a.sortKey !== null && b.sortKey !== null) {
            return a.sortKey! - b.sortKey!;
        }
        if (a.sortKey === null && b.sortKey !== null) return 1;
        if (a.sortKey !== null && b.sortKey === null) return -1;
        return 0;
    });

    // Если не нужно передавать sortKey дальше, можно удалить это свойство:
    return result.map(({ sortKey, ...rest }) => rest);
};
