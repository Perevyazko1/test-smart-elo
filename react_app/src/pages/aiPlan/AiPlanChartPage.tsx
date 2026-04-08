import {useMemo, useState} from "react";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {$axios} from "@/shared/api";
import {twMerge} from "tailwind-merge";
import {STATIC_URL} from "@/shared/consts/serverConfig.ts";
import toast from "react-hot-toast";

/* ─── Типы данных графика ──────────────────────────────────────── */

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

/* ─── Цвета загрузки ячеек ─────────────────────────────────────── */

const LOAD_COLORS: Record<string, string> = {
    overload: "bg-red-400",
    full: "bg-yellow-300",
    light: "bg-green-200",
    empty: "bg-white",
};

/* ─── Форматирование дат ───────────────────────────────────────── */

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
    const queryClient = useQueryClient();
    const [refreshing, setRefreshing] = useState(false);

    /* Загрузка данных графика из кэша (AiPlanConfig.chart_data).
       Если 404 — значит график ещё не был сгенерирован. */
    const {data, isLoading, error} = useQuery<ChartData>({
        queryKey: ["chartData"],
        queryFn: () => $axios.get<ChartData>('/plan/chart/').then(r => r.data),
        retry: false,  // не повторять при 404
    });

    const departments = data?.departments || [];
    const totalDays = data?.total_days || 0;
    const grid = data?.grid || {};

    /* Массив дат начиная с сегодня — для заголовков колонок */
    const dates = useMemo(() => {
        const today = new Date();
        return Array.from({length: totalDays}, (_, i) => {
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            return d;
        });
    }, [totalDays]);

    /* Пересчитать таблицу без GPT — только Python-расчёт весов и раскладка */
    const handleRefresh = () => {
        setRefreshing(true);
        $axios.post('/plan/chart/refresh/')
            .then(() => {
                queryClient.invalidateQueries({queryKey: ["chartData"]});
                toast.success('Таблица обновлена');
            })
            .catch(err => {
                toast.error(err.response?.data?.error || 'Ошибка обновления таблицы');
            })
            .finally(() => setRefreshing(false));
    };

    /* Состояние загрузки */
    if (isLoading) {
        return (
            <div className="bg-white p-4 flex items-center justify-center h-64">
                <div className="text-slate-400 text-sm">Загрузка графика...</div>
            </div>
        );
    }

    /* Если график ещё не сгенерирован (404) — показать сообщение с кнопкой */
    // @ts-ignore — axios error shape
    if (error && error?.response?.status === 404) {
        return (
            <div className="bg-white p-4 flex flex-col items-center justify-center h-64 gap-4">
                <div className="text-slate-400 text-sm">
                    График не сгенерирован. Запустите генерацию AI плана или обновите таблицу.
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    {refreshing ? 'Обновление...' : 'Построить таблицу'}
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white p-4 flex flex-col gap-4">
            {/* Заголовок и кнопка обновления */}
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold text-slate-800">AI Plan — График загрузки цехов</h1>
                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1.5"
                >
                    {refreshing ? (
                        <>
                            <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                            </svg>
                            Обновление...
                        </>
                    ) : 'Обновить таблицу'}
                </button>
            </div>

            {/* Легенда цветов загрузки */}
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
                                {/* Фиксированная колонка с названиями цехов */}
                                <th className="sticky left-0 z-10 bg-slate-50 border-r border-b border-slate-200 px-3 py-2 text-left text-xs font-semibold text-slate-600 w-[120px]">
                                    Цех
                                </th>
                                {/* Колонки дат — выходные подсвечены, сегодня выделен */}
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
                            {/* Строка на каждый цех — ячейки раскрашены по уровню загрузки */}
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
                                                {/* Карточки заказов в два столбца */}
                                                <div className="grid grid-cols-2 gap-0.5">
                                                    {cell.orders.map((o, j) => (
                                                        <div
                                                            key={j}
                                                            className="relative w-[42px] h-[50px] rounded overflow-hidden border border-slate-300 bg-slate-100"
                                                            title={`${o.order} — ${o.name} (${o.count} шт)`}
                                                        >
                                                            {/* Фото изделия или название-заглушка */}
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
                                                            {/* Номер заказа — белый текст на тёмном фоне сверху */}
                                                            <div className="absolute top-0 left-0 right-0 bg-black/60 text-white text-[7px] px-0.5 truncate leading-tight">
                                                                {o.order}
                                                            </div>
                                                            {/* Количество штук — красный бейдж справа внизу */}
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
