import {useMemo, useState} from "react";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {$axios} from "@/shared/api";
import {twMerge} from "tailwind-merge";
import {STATIC_URL} from "@/shared/consts/serverConfig.ts";
import {toast} from "sonner";
import {ChartProductModal} from "./ChartProductModal";

/* ─── Типы данных графика ──────────────────────────────────────── */

interface ChartOrder {
    name: string;
    order: string;
    picture: string | null;
    count: number;
    product_id?: number;
    order_id?: number;
}

interface ChartCell {
    orders: ChartOrder[];
    load: "overload" | "full" | "light" | "empty";
    hours: number;
}

interface ForecastPeriod {
    day_from: number;
    day_to: number;
    date_from?: string;
    date_to?: string;
    total_sum: number;
    orders_count: number;
    product_types: Record<string, number>;
    late: number;
    on_time: number;
    early: number;
    no_deadline: number;
}

interface ChartData {
    departments: string[];
    total_days: number;
    grid: Record<string, ChartCell[]>;
    dates?: string[];  // Реальные даты рабочих дней (ISO, без выходных)
    forecast_periods?: ForecastPeriod[];
    already_overdue?: number;
    already_overdue_sum?: number;
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

/** Форматирование суммы: 1234567.89 → "1 234 568 ₽" */
function formatMoney(value: number): string {
    return Math.round(value).toLocaleString("ru-RU") + " ₽";
}

/** Дата + N дней → "10 апр 2026" */
function formatFullDate(daysFromNow: number): string {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    const months = ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export const AiPlanChartPage = () => {
    const queryClient = useQueryClient();
    const [refreshing, setRefreshing] = useState(false);
    const [modal, setModal] = useState<{productId: number; name: string; picture: string | null} | null>(null);

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
    const forecastPeriods = data?.forecast_periods || [];
    const alreadyOverdue = data?.already_overdue || 0;
    const alreadyOverdueSum = data?.already_overdue_sum || 0;

    /* Массив дат из бэкенда (только рабочие дни, без сб/вс).
       Фолбэк на старую логику если бэкенд не вернул dates. */
    const dates = useMemo(() => {
        if (data?.dates?.length) {
            return data.dates.map(iso => new Date(iso + 'T00:00:00'));
        }
        const today = new Date();
        return Array.from({length: totalDays}, (_, i) => {
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            return d;
        });
    }, [totalDays, data?.dates]);

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

            {/* Плашка: уже просрочено на сегодня */}
            {alreadyOverdue > 0 && (
                <div className="flex items-center gap-3 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-sm">
                    <span className="text-red-600 font-semibold">На сегодня уже просрочено:</span>
                    <span className="text-red-700 font-bold">{alreadyOverdue} заказов</span>
                    <span className="text-red-400">на сумму</span>
                    <span className="text-red-700 font-bold">{formatMoney(alreadyOverdueSum)}</span>
                </div>
            )}

            {/* Прогноз выручки по 30-дневным периодам */}
            {forecastPeriods.length > 0 && (
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full border-collapse text-xs">
                        <thead>
                            <tr className="bg-slate-50">
                                <th className="border-b border-slate-200 px-3 py-2 text-left font-semibold text-slate-600 w-[200px]">Период</th>
                                <th className="border-b border-l border-slate-200 px-3 py-2 text-right font-semibold text-slate-600 w-[80px]">Заказов</th>
                                <th className="border-b border-l border-slate-200 px-3 py-2 text-center font-semibold text-slate-600 w-[200px]">Сроки</th>
                                <th className="border-b border-l border-slate-200 px-3 py-2 text-right font-semibold text-slate-600 w-[150px]">Сумма</th>
                                <th className="border-b border-l border-slate-200 px-3 py-2 text-left font-semibold text-slate-600">Типы изделий</th>
                            </tr>
                        </thead>
                        <tbody>
                            {forecastPeriods.map((period, idx) => {
                                // Используем реальные даты из бэкенда (с учётом выходных)
                                const dateFrom = period.date_from
                                    ? formatDate(new Date(period.date_from + 'T00:00:00'))
                                    : formatFullDate(period.day_from);
                                const dateTo = period.date_to
                                    ? formatDate(new Date(period.date_to + 'T00:00:00'))
                                    : formatFullDate(period.day_to);
                                const types = Object.entries(period.product_types)
                                    .sort((a, b) => b[1] - a[1])
                                    .map(([name, count]) => `${name}: ${count}`)
                                    .join(", ");
                                return (
                                    <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                                        <td className="border-b border-slate-100 px-3 py-1.5 text-slate-700 whitespace-nowrap">
                                            {dateFrom} — {dateTo}
                                        </td>
                                        <td className="border-b border-l border-slate-100 px-3 py-1.5 text-right text-slate-700 font-medium">
                                            {period.orders_count}
                                        </td>
                                        <td className="border-b border-l border-slate-100 px-3 py-1.5 text-center whitespace-nowrap">
                                            {period.orders_count > 0 ? (
                                                <span className="inline-flex gap-2 text-[11px]">
                                                    {period.late > 0 && <span className="text-red-600" title="С опозданием">{period.late} опозд.</span>}
                                                    {period.on_time > 0 && <span className="text-slate-600" title="В срок">{period.on_time} в срок</span>}
                                                    {period.early > 0 && <span className="text-green-600" title="Раньше срока">{period.early} раньше</span>}
                                                    {period.no_deadline > 0 && <span className="text-slate-400" title="Без дедлайна">{period.no_deadline} без срока</span>}
                                                </span>
                                            ) : "—"}
                                        </td>
                                        <td className="border-b border-l border-slate-100 px-3 py-1.5 text-right font-medium whitespace-nowrap"
                                            style={{color: period.total_sum > 0 ? '#16a34a' : '#94a3b8'}}>
                                            {period.total_sum > 0 ? formatMoney(period.total_sum) : "—"}
                                        </td>
                                        <td className="border-b border-l border-slate-100 px-3 py-1.5 text-slate-500">
                                            {types || "—"}
                                        </td>
                                    </tr>
                                );
                            })}
                            {/* Строка-итог */}
                            <tr className="bg-slate-100 font-semibold">
                                <td className="border-t border-slate-300 px-3 py-2 text-slate-700">Итого</td>
                                <td className="border-t border-l border-slate-300 px-3 py-2 text-right text-slate-700">
                                    {forecastPeriods.reduce((s, p) => s + p.orders_count, 0)}
                                </td>
                                <td className="border-t border-l border-slate-300 px-3 py-2 text-center whitespace-nowrap">
                                    <span className="inline-flex gap-2 text-[11px]">
                                        {(() => {
                                            const totLate = forecastPeriods.reduce((s, p) => s + p.late, 0);
                                            const totOnTime = forecastPeriods.reduce((s, p) => s + p.on_time, 0);
                                            const totEarly = forecastPeriods.reduce((s, p) => s + p.early, 0);
                                            const totNoDl = forecastPeriods.reduce((s, p) => s + p.no_deadline, 0);
                                            return <>
                                                {totLate > 0 && <span className="text-red-600">{totLate} опозд.</span>}
                                                {totOnTime > 0 && <span className="text-slate-600">{totOnTime} в срок</span>}
                                                {totEarly > 0 && <span className="text-green-600">{totEarly} раньше</span>}
                                                {totNoDl > 0 && <span className="text-slate-400">{totNoDl} без срока</span>}
                                            </>;
                                        })()}
                                    </span>
                                </td>
                                <td className="border-t border-l border-slate-300 px-3 py-2 text-right text-green-700 whitespace-nowrap">
                                    {formatMoney(forecastPeriods.reduce((s, p) => s + p.total_sum, 0))}
                                </td>
                                <td className="border-t border-l border-slate-300 px-3 py-2 text-slate-500">
                                    {(() => {
                                        const totals: Record<string, number> = {};
                                        forecastPeriods.forEach(p => {
                                            Object.entries(p.product_types).forEach(([name, count]) => {
                                                totals[name] = (totals[name] || 0) + count;
                                            });
                                        });
                                        return Object.entries(totals)
                                            .sort((a, b) => b[1] - a[1])
                                            .map(([name, count]) => `${name}: ${count}`)
                                            .join(", ");
                                    })()}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}

            {totalDays === 0 ? (
                <div className="text-slate-400 text-sm py-8 text-center">Нет данных для отображения</div>
            ) : (
                <div className="border border-slate-200 rounded-lg overflow-auto max-h-[80vh]">
                    <table className="border-collapse w-full" style={{minWidth: 120 + totalDays * 134}}>
                        <thead>
                            <tr className="bg-slate-50">
                                {/* Угловая ячейка: фиксирована и по горизонтали, и по вертикали */}
                                <th className="sticky left-0 top-0 z-20 bg-slate-50 border-r border-b border-slate-200 px-3 py-2 text-left text-xs font-semibold text-slate-600 w-[120px]">
                                    Цех
                                </th>
                                {/* Колонки дат — только рабочие дни (без сб/вс) */}
                                {dates.map((date, i) => {
                                    const todayStr = new Date().toDateString();
                                    const isToday = date.toDateString() === todayStr;
                                    return (
                                        <th
                                            key={i}
                                            className={twMerge(
                                                "sticky top-0 z-10 border-b border-l border-slate-200 px-1 py-1.5 text-center text-[10px] min-w-[134px]",
                                                "bg-slate-50 text-slate-600",
                                                isToday && "!bg-blue-50 text-blue-700 font-bold"
                                            )}
                                        >
                                            <div className="font-semibold">{formatDate(date)}</div>
                                            <div className="text-[9px]">{getDayOfWeek(date)}</div>
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
                                        return (
                                            <td
                                                key={i}
                                                className={twMerge(
                                                    "border-b border-l border-slate-200 align-top p-0.5",
                                                    LOAD_COLORS[cell.load],
                                                )}
                                                /* Фиксированная высота ячейки: 3 ряда карточек (50px) + промежутки (2px) + отступы */
                                                style={{height: 160, width: 134}}
                                            >
                                                {/* Карточки заказов в три столбца, прокрутка если больше 9 */}
                                                <div className="grid grid-cols-3 gap-0.5 overflow-y-auto h-full">
                                                    {cell.orders.map((o, j) => (
                                                        <div
                                                            key={j}
                                                            className="relative w-[42px] h-[50px] rounded overflow-hidden border border-slate-300 bg-slate-100 cursor-pointer hover:border-blue-400 hover:shadow-sm transition-all"
                                                            title={`${o.order} — ${o.name} (${o.count} шт)`}
                                                            onClick={() => o.product_id && setModal({productId: o.product_id, name: o.name, picture: o.picture})}
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

            {/* Модалка с деталями изделия и нормативами */}
            <ChartProductModal
                productId={modal?.productId ?? null}
                productName={modal?.name ?? ""}
                picture={modal?.picture ?? null}
                isOpen={modal !== null}
                onClose={() => setModal(null)}
            />
        </div>
    );
};
