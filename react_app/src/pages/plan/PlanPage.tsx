import {PlanRow} from "@/widgets/plan/planTable/PlanRow.tsx";
import {useQuery} from "@tanstack/react-query";
import {planService} from "@/widgets/plan/model/api.ts";
import {usePlanProject} from "@/shared/state/plan/planProject.ts";
import {usePlanManager} from "@/shared/state/plan/planManagers.ts";
import {useState, useMemo} from "react";
import {twMerge} from "tailwind-merge";
import {usePlanAgent} from "@/shared/state/plan/planAgent.ts";
import {usePermission} from "@/shared/utils/permissions.ts";
import {APP_PERM} from "@/entities/user";
import {usePlanSum} from "@/shared/state/plan/planSum.ts";
import {useUrgencyFilter} from "@/shared/state/plan/urgencyFilter.ts";

const DEPARTMENTS = [
    "Конструктора",
    "Сборка",
    "Пошив",
    "Малярка",
    "Обивка",
    "Упаковка",
];

export const PlanPage = () => {
    const planProject = usePlanProject((s) => s.planProject);
    const planManager = usePlanManager((s) => s.planManager);
    const planAgent = usePlanAgent(s => s.planAgent);
    const urgency = useUrgencyFilter(s => s.urgencyFilter);
    const planSum = usePlanSum(s => s.planSum);
    const showSums = usePermission([
        APP_PERM.KPI_PAGE,
        APP_PERM.ADMIN,
    ]);
    const {data, isFetching, isPending} = useQuery({
        queryKey: ["planTable", planProject, planManager, planAgent],
        queryFn: () =>
            planService.getPlanTable({
                project: planProject === "Все проекты" ? null : planProject,
                manager_id: planManager,
                agent_id: planAgent,
            }),
    });

    const [selectedDepartment, setSelectedDepartment] = useState<string | null>(
        null
    );

    const [showMode, setShowMode] = useState<"final_waiting" | "shipped" | null>(null)

    const sortedEntries = useMemo(() => {
        const filtered = Object.entries(data?.data || {}).filter(([_, item]) => {
            if (urgency && !urgency.includes(item.urgency)) {
                return false;
            }

            if (!selectedDepartment) {
                if (showMode === "final_waiting") {
                    return item.final_waiting > 0;
                }
                if (showMode === "shipped") {
                    return item.quantity > item.shipped;
                }
                return true;
            }
            const dept = item.assignments[selectedDepartment];
            if (showMode === "final_waiting") {
                return dept && dept.all !== dept.ready && item.final_waiting > 0;
            }
            if (showMode === "shipped") {
                return dept && dept.all !== dept.ready && item.quantity > item.shipped;
            }
            return dept && dept.all !== dept.ready;
        });

        return filtered.sort((a, b) => {
            if (!a[1].date && !b[1].date) return 0;
            if (!a[1].date) return 1;
            if (!b[1].date) return -1;
            return (
                new Date(a[1].date).getTime() -
                new Date(b[1].date).getTime()
            );
        });
    }, [data, selectedDepartment, showMode, urgency]);

    // Автоматический расчет тоталов по отделам
    const totals = useMemo(() => {
        const result: Record<string, number> = {};
        for (const dept of DEPARTMENTS) {
            result[dept] = sortedEntries.reduce((acc, [_, item]) => {
                if (dept === "Отгружено") {
                    return acc + (item.quantity - item.shipped) * Number(item.price);
                }
                const d = item.assignments[dept];
                return acc + ((d?.all || 0) - (d?.ready || 0)) * Number(item.price) * (dept === "Конструктора" ? item.quantity : 1);
            }, 0);
        }
        return result;
    }, [sortedEntries]);

    const getTotalSum = (index: number) => {
        return sortedEntries.slice(0, index).reduce((acc, [_, item]) => {
            return acc + item.final_waiting * Number(item.price);
        }, 0);
    }

    const deps = DEPARTMENTS.filter(dept => planSum ? dept !== "Упаковка" : true);
    const excludeItems = [
        "Упаковка",
        "МС ОТГР",
    ]
    const printDepartments = deps.filter(dept => !excludeItems.includes(dept));

    return (
        <div className="max-w-dvw bg-white p-4">
            <div className="flex gap-2">
                <span>ПЛАН СТРАНИЦА </span>
                {(isFetching || isPending) && (
                    <div className="animate-pulse size-6">🔄️</div>
                )}
            </div>

            <table className="w-full">
                <thead>
                <tr>
                    <th>#</th>
                    <th rowSpan={2}>ДАТА</th>
                    <th rowSpan={2}>ШТ</th>
                    <th rowSpan={2}>Изделие</th>
                    {deps.map((dept) => (
                        <th
                            key={dept}
                            onClick={() =>
                                setSelectedDepartment(
                                    selectedDepartment === dept ? null : dept
                                )
                            }
                            className={twMerge(
                                "max-w-[5em] overflow-hidden text-ellipsis whitespace-nowrap",
                                selectedDepartment === dept ? "bg-blue-200 cursor-pointer" : "cursor-pointer",
                                printDepartments.includes(dept) ? "" : "noPrint",
                            )}
                        >
                            {dept}
                        </th>

                    ))}

                    <th
                        rowSpan={2}
                        onClick={() => setShowMode(showMode === "final_waiting" ? null : "final_waiting")}
                        className={twMerge(
                            "max-w-[5em] overflow-hidden text-ellipsis whitespace-nowrap",
                            showMode === "final_waiting" ? "bg-blue-200 cursor-pointer" : "cursor-pointer"
                        )}
                    >
                        Готовность
                    </th>
                </tr>
                <tr>
                    <th>#</th>
                    {deps.map((dept) => (
                        <th key={dept} className={twMerge(
                            printDepartments.includes(dept) ? "" : "noPrint",
                            "px-1 text-right"
                        )}>
                            {showSums ? Math.round((totals[dept] || 0) / 1000).toLocaleString("ru-RU") : "-"}
                        </th>
                    ))}
                </tr>
                </thead>

                <tbody>
                {sortedEntries.map(([key, item], index) => (
                    <PlanRow
                        key={key}
                        index={index}
                        data={item}
                        sum={getTotalSum(index)}
                    />
                ))}
                </tbody>
            </table>
        </div>
    );
};
