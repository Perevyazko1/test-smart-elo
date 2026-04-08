import {useMemo} from "react";
import {useQuery} from "@tanstack/react-query";
import {$axios} from "@/shared/api";
import {twMerge} from "tailwind-merge";
import {STATIC_URL} from "@/shared/consts/serverConfig.ts";

interface ChartOrder {
    name: string;
    order: string;
    picture: string | null;
    count: number;
}

interface ChartCell {
    orders: ChartOrder[];
    load: "overload" | "full" | "light" | "empty";
    hours: number;
}

interface ChartData {
    departments: string[];
    total_days: number;
    grid: Record<string, ChartCell[]>;
}

const LOAD_COLORS: Record<string, string> = {
    overload: "bg-red-400",
    full: "bg-yellow-300",
    light: "bg-green-200",
    empty: "bg-white",
};

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
    const {data, isLoading} = useQuery<ChartData>({
        queryKey: ["chartData"],
        queryFn: () => $axios.get<ChartData>('/plan/chart/').then(r => r.data),
    });

    const departments = data?.departments || [];
    const totalDays = data?.total_days || 0;
    const grid = data?.grid || {};

    const dates = useMemo(() => {
        const today = new Date();
        return Array.from({length: totalDays}, (_, i) => {
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            return d;
        });
    }, [totalDays]);

    if (isLoading) {
        return (
            <div className="bg-white p-4 flex items-center justify-center h-64">
                <div className="text-slate-400 text-sm">Загрузка графика...</div>
            </div>
        );
    }

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

            {totalDays === 0 ? (
                <div className="text-slate-400 text-sm py-8 text-center">Нет данных для отображения</div>
            ) : (
                <div className="border border-slate-200 rounded-lg overflow-x-auto">
                    <table className="border-collapse w-full" style={{minWidth: 120 + totalDays * 90}}>
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
                                                "border-b border-l border-slate-200 px-1 py-1.5 text-center text-[10px] min-w-[90px]",
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
                                                    "border-b border-l border-slate-200 align-top p-0.5",
                                                    LOAD_COLORS[cell.load],
                                                    isWeekend && cell.load === "empty" && "bg-slate-50"
                                                )}
                                                style={{minHeight: 70}}
                                            >
                                                <div className="flex flex-wrap gap-0.5">
                                                    {cell.orders.map((o, j) => (
                                                        <div
                                                            key={j}
                                                            className="relative w-[42px] h-[50px] rounded overflow-hidden border border-slate-300 bg-slate-100"
                                                            title={`${o.order} — ${o.name} (${o.count} шт)`}
                                                        >
                                                            {o.picture ? (
                                                                <img
                                                                    src={STATIC_URL + o.picture}
                                                                    alt=""
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-[7px] text-slate-400 p-0.5 text-center leading-tight">
                                                                    {o.name.slice(0, 15)}
                                                                </div>
                                                            )}
                                                            <div className="absolute top-0 left-0 right-0 bg-black/60 text-white text-[7px] px-0.5 truncate leading-tight">
                                                                {o.order}
                                                            </div>
                                                            <div className="absolute bottom-0 right-0 bg-red-600 text-white text-[9px] font-bold px-1 rounded-tl leading-tight">
                                                                {o.count}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
