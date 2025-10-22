import {EqOrderProduct} from "@widgets/EqCardList";
import {Employee} from "@entities/Employee";

export const groupByPlanDate = (
    data: EqOrderProduct[],
    listType: string,
    currentUser: Employee
): EqOrderProduct[] => {
    // 1. Собираем все assignments с привязкой к родительскому EqOrderProduct
    const allAssignments = data.flatMap((item) =>
        item.assignments.map((assignment) => ({
            parentItem: item,
            assignment,
            sortKey: assignment.plane_date ? new Date(assignment.plane_date).getTime() : null,
        }))
    );

    // 2. Разделяем на элементы с plane_date и без
    const withPlaneDate = allAssignments.filter((item) => item.sortKey !== null);
    const withoutPlaneDate = allAssignments.filter((item) => item.sortKey === null);

    // 3. Сортируем элементы с plane_date по sortKey
    withPlaneDate.sort((a, b) => {
        if (a.sortKey !== null && b.sortKey !== null) {
            return a.sortKey - b.sortKey;
        }
        return 0; // На случай, если вдруг null-ы просочились
    });

    // 4. Сортируем элементы без plane_date по умолчанию
    withoutPlaneDate.sort((a, b) => {
        const itemA = a.parentItem;
        const itemB = b.parentItem;

        const hasAssignmentsA = itemA.assignments.length !== 0 ? 1 : 0;
        const hasAssignmentsB = itemB.assignments.length !== 0 ? 1 : 0;
        const assignmentsDiff = hasAssignmentsB - hasAssignmentsA;

        if (assignmentsDiff !== 0) {
            return assignmentsDiff;
        }

        if (listType === "ready") {
            const inspectorNullA = itemA.assignments.some(
                (assignment) => assignment.inspector === null
            )
                ? 1
                : 0;
            const inspectorNullB = itemB.assignments.some(
                (assignment) => assignment.inspector === null
            )
                ? 1
                : 0;
            const inspectorDiff = inspectorNullB - inspectorNullA;

            if (inspectorDiff !== 0) {
                return inspectorDiff;
            }

            if (currentUser.current_department_details?.piecework_wages) {
                const hasTariffA =
                    itemA.assignments.length > 0
                        ? itemA.assignments[0].new_tariff?.id
                            ? 0
                            : 1
                        : 1;
                const hasTariffB =
                    itemB.assignments.length > 0
                        ? itemB.assignments[0].new_tariff?.id
                            ? 0
                            : 1
                        : 1;

                const tariffDiff = hasTariffB - hasTariffA;

                if (tariffDiff !== 0) {
                    return tariffDiff;
                }
            }
        }

        const urgencyDiff = itemA.urgency - itemB.urgency;

        if (urgencyDiff !== 0) {
            return urgencyDiff;
        }

        const plannedDateA = itemA.order.planned_date
            ? new Date(itemA.order.planned_date)
            : new Date(0);
        const plannedDateB = itemB.order.planned_date
            ? new Date(itemB.order.planned_date)
            : new Date(0);
        const plannedDateDiff = plannedDateA.getTime() - plannedDateB.getTime();
        if (plannedDateDiff !== 0) {
            return plannedDateDiff;
        }

        const orderNumberDiff = itemA.order.id - itemB.order.id;
        if (orderNumberDiff !== 0) {
            return orderNumberDiff;
        }

        return itemA.id - itemB.id;
    });

    // 5. Группируем по комбинации itemId и plane_date
    const resultMap = new Map<string, EqOrderProduct>();

    // Сначала добавляем элементы с plane_date
    withPlaneDate.forEach(({parentItem, assignment}) => {
        const dateKey = assignment.plane_date || "no_date";
        const uniqueKey = `${parentItem.id}-${dateKey}`;

        if (!resultMap.has(uniqueKey)) {
            resultMap.set(uniqueKey, {
                ...parentItem,
                assignments: [],
                plane_date: assignment.plane_date,
            });
        }
        resultMap.get(uniqueKey)!.assignments.push(assignment);
    });

    // Затем добавляем элементы без plane_date
    withoutPlaneDate.forEach(({parentItem, assignment}) => {
        const dateKey = "no_date";
        const uniqueKey = `${parentItem.id}-${dateKey}`;

        if (!resultMap.has(uniqueKey)) {
            resultMap.set(uniqueKey, {
                ...parentItem,
                assignments: [],
                plane_date: null,
            });
        }
        resultMap.get(uniqueKey)!.assignments.push(assignment);
    });

    // 6. Преобразуем Map в массив и возвращаем
    return Array.from(resultMap.values());
};