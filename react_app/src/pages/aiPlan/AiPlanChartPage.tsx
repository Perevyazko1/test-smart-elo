import {useMemo} from "react";
import {useQuery} from "@tanstack/react-query";
import {$axios} from "@/shared/api";
import {twMerge} from "tailwind-merge";

interface DeptDayCell {
    orders: {name: string; picture: string; count: number}[];
    load: "overload" | "full" | "light" | "empty";
}

const LOAD_COLORS: Record<string, string> = {
    overload: "bg-red-400",
    full: "bg-yellow-300",
    light: "bg-green-200",
    empty: "bg-white",
};

const DEMO_DEPTS = [
    "Пила", "Сборка", "Крой", "Пошив", "ППУ", "Обивка", "Малярка", "Конструктора",
];

function generateDemoData(departments: string[], days: number) {
    const grid: Record<string, DeptDayCell[]> = {};
    for (const dept of departments) {
        const row: DeptDayCell[] = [];
        // Each dept has a "loaded" range and then tapers off
        const loadDays = Math.floor(Math.random() * 15) + 3;
        for (let d = 0; d < days; d++) {
            let load: DeptDayCell["load"] = "empty";
            if (d < loadDays) {
                if (d < 2 && Math.random() > 0.7) load = "overload";
                else load = "full";
            } else if (d < loadDays + 2) {
                load = "light";
            }
            row.push({orders: [], load});
        }
        grid[dept] = row;
    }
    return grid;
}

function formatDate(date: Date): string {
    const d = date.getDate();
    const months = ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
    return `${d} ${months[date.getMonth()]}`;
}

function getDayOfWeek(date: Date): string {
    const days = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];
    return days[date.getDay()];
}

export const AiPlanChartPage = () => {
    const {data: deptsData} = useQuery({
        queryKey: ["departments"],
        queryFn: () => $axios.get<{departments: string[]}>('/plan/departments/').then(r => r.data),
    });
    const departments = deptsData?.departments || DEMO_DEPTS;

    const DAYS = 30;

    const dates = useMemo(() => {
        const today = new Date();
        return Array.from({length: DAYS}, (_, i) => {
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            return d;
        });
    }, []);

    const grid = useMemo(() => generateDemoData(departments, DAYS), [departments]);

    return (
        <div className="bg-white p-4 flex flex-col gap-4">
            <h1 className="text-lg font-semibold text-slate-800">AI Plan — График загрузки цехов</h1>

            <div className="flex gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded bg-red-400 border border-red-500"/>
                    Перегрузка
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded bg-yellow-300 border border-yellow-400"/>
                    Загружен
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded bg-green-200 border border-green-300"/>
                    Мало работы
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded bg-white border border-slate-200"/>
                    Пусто
                </div>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-x-auto">
                <table className="border-collapse w-full" style={{minWidth: 120 + DAYS * 80}}>
                    <thead>
                        <tr className="bg-slate-50">
                            <th className="sticky left-0 z-10 bg-slate-50 border-r border-b border-slate-200 px-3 py-2 text-left text-xs font-semibold text-slate-600 w-[120px]">
                                Цех
                            </th>
                            {dates.map((date, i) => {
                                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                                const isToday = i === 0;
                                return (
                                    <th
                                        key={i}
                                        className={twMerge(
                                            "border-b border-l border-slate-200 px-1 py-1.5 text-center text-[10px] min-w-[80px]",
                                            isWeekend ? "bg-slate-100 text-slate-400" : "text-slate-600",
                                            isToday && "bg-blue-50 text-blue-700 font-bold"
                                        )}
                                    >
                                        <div className="font-semibold">{formatDate(date)}</div>
                                        <div className={twMerge("text-[9px]", isWeekend && "text-red-400")}>
                                            {getDayOfWeek(date)}
                                        </div>
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {departments.map(dept => (
                            <tr key={dept}>
                                <td className="sticky left-0 z-10 bg-white border-r border-b border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 w-[120px]">
                                    {dept}
                                </td>
                                {(grid[dept] || []).map((cell, i) => {
                                    const isWeekend = dates[i]?.getDay() === 0 || dates[i]?.getDay() === 6;
                                    return (
                                        <td
                                            key={i}
                                            className={twMerge(
                                                "border-b border-l border-slate-200 h-[70px] align-top p-1",
                                                LOAD_COLORS[cell.load],
                                                isWeekend && cell.load === "empty" && "bg-slate-50"
                                            )}
                                        >
                                            {cell.orders.length > 0 && (
                                                <div className="flex flex-wrap gap-0.5">
                                                    {cell.orders.map((o, j) => (
                                                        <div key={j} className="text-[8px] text-slate-600 truncate max-w-[70px]">
                                                            {o.name}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
