import {useState} from "react";
import {Btn} from "@/shared/ui/buttons/Btn.tsx";
import {twMerge} from "tailwind-merge";

const WORKSHOPS = ["ЦЕХ 1", "ЦЕХ 2", "ЦЕХ 3"];

interface IOrder {
    id: number;
    name: string;
    schema: string;
    client: string;
    project: string | null;
    deadline: string;
    quantity: number;
    orderNumber: string;
    image: string | null;
    sortWeight: number;
    sortPosition: number;
    urgency: "high" | "medium" | "low";
    workshops: { name: string; total: number; ready: number }[];
    aiComment: string;
    feedbackComment: string;
}

const TEST_ORDERS: IOrder[] = [
    {
        id: 1,
        name: "Кресло не прямое",
        schema: "СХЕМА-А1",
        client: "ООО Мебельторг",
        project: null,
        deadline: "2026-04-10",
        quantity: 12,
        orderNumber: "ЗК-1041",
        image: null,
        sortWeight: 30,
        sortPosition: 3,
        urgency: "low",
        workshops: [
            {name: "ЦЕХ 1", total: 12, ready: 8},
            {name: "ЦЕХ 2", total: 12, ready: 5},
            {name: "ЦЕХ 3", total: 12, ready: 2},
        ],
        aiComment: "Стандартный заказ, без отклонений. Прогноз завершения — 8 апреля.",
        feedbackComment: "",
    },
    {
        id: 2,
        name: "Диван Well",
        schema: "СХЕМА-Б2",
        client: "ИП Куренов",
        project: "ПРОЕКТ WELL",
        deadline: "2026-04-05",
        quantity: 6,
        orderNumber: "ЗК-1038",
        image: null,
        sortWeight: 95,
        sortPosition: 1,
        urgency: "high",
        workshops: [
            {name: "ЦЕХ 1", total: 6, ready: 6},
            {name: "ЦЕХ 2", total: 6, ready: 3},
            {name: "ЦЕХ 3", total: 6, ready: 0},
        ],
        aiComment: "ВНИМАНИЕ: Срок горит! Цех 3 ещё не начинал. Рекомендуется перераспределить ресурсы с заказа №3.",
        feedbackComment: "Клиент звонил, просит ускорить. Обещали к пятнице.",
    },
    {
        id: 3,
        name: "Диван Well",
        schema: "СХЕМА-Б2",
        client: "ООО Комфорт Плюс",
        project: null,
        deadline: "2026-04-15",
        quantity: 20,
        orderNumber: "ЗК-1045",
        image: null,
        sortWeight: 60,
        sortPosition: 2,
        urgency: "medium",
        workshops: [
            {name: "ЦЕХ 1", total: 20, ready: 15},
            {name: "ЦЕХ 2", total: 20, ready: 10},
            {name: "ЦЕХ 3", total: 20, ready: 4},
        ],
        aiComment: "Большой заказ, темп хороший. При сохранении текущей скорости — успеваем на 2 дня раньше срока.",
        feedbackComment: "",
    },
];

const AI_SUMMARY = "Общая загрузка производства: 78%. Критический заказ — №2 (Диван Well для ИП Куренов), срок 5 апреля, цех 3 не начинал работу. Рекомендуется приоритизировать. Заказы №1 и №3 идут по плану. Свободные мощности в цехе 1 можно перенаправить на цех 3 по заказу №2.";

export const AiPlanPage = () => {
    const [prompt, setPrompt] = useState("");
    const [basePrompt, setBasePrompt] = useState(
        "Мы — мебельная фабрика. 3 цеха, 45 сотрудников. Приоритет: сначала горящие сроки, потом крупные заказы. Учитывай загрузку цехов при планировании."
    );

    return (
        <div className="max-w-dvw bg-white p-4 flex flex-col gap-4">
            {/* Input + Voice */}
            <div className="flex gap-2 items-center">
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Спросите AI о планировании..."
                    className="flex-1 border border-slate-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-blue-400"
                />
                <Btn className="border border-slate-300 rounded-lg px-4 py-3 text-xl">
                    🎙
                </Btn>
            </div>

            {/* AI Summary */}
            <div className="border border-slate-200 rounded-lg bg-blue-50 p-4 text-sm text-slate-700">
                <span className="font-semibold text-slate-900">AI: </span>
                {AI_SUMMARY}
            </div>

            {/* Orders */}
            <div className="flex flex-col gap-3">
                {TEST_ORDERS.map((order, idx) => (
                    <OrderCard key={order.id} order={order} index={idx + 1}/>
                ))}
            </div>

            {/* Base Prompt */}
            <div className="border border-slate-200 rounded-lg p-4">
                <label className="text-xs text-slate-500 font-semibold mb-1 block">
                    Базовый промпт (о фабрике, сотрудниках, принципах планирования)
                </label>
                <textarea
                    value={basePrompt}
                    onChange={(e) => setBasePrompt(e.target.value)}
                    rows={3}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 resize-y"
                />
            </div>
        </div>
    );
};

function OrderCard({order, index}: { order: IOrder; index: number }) {
    const urgencyStyles = {
        high: "border-red-400 bg-red-50",
        medium: "border-yellow-300 bg-yellow-50",
        low: "border-slate-200 bg-white",
    };

    return (
        <div
            className={twMerge(
                "border rounded-lg p-3 flex gap-3 items-stretch",
                urgencyStyles[order.urgency]
            )}
        >
            {/* Left: meta + image */}
            <div className="flex flex-col items-center gap-1 min-w-[80px] text-[10px] text-slate-500">
                <div>важность: <b>{order.sortWeight}</b></div>
                <div>поз: <b>#{order.sortPosition}</b></div>
                <div className="w-[70px] h-[70px] bg-slate-200 rounded flex items-center justify-center text-[9px] text-slate-400">
                    {order.image ? (
                        <img src={order.image} alt="" className="w-full h-full object-cover rounded"/>
                    ) : (
                        "нет фото"
                    )}
                </div>
            </div>

            {/* Number */}
            <div className="flex items-center justify-center text-2xl font-bold text-slate-700 min-w-[50px]">
                №{index}
            </div>

            {/* Main info */}
            <div className="flex-1 flex flex-col gap-1 min-w-[200px]">
                <div className="font-semibold text-sm">
                    {order.name} {order.schema && `+ ${order.schema}`}
                </div>
                <div className="text-xs text-slate-600">
                    <span className={twMerge(order.urgency === "high" && "bg-red-200 px-1 rounded font-semibold")}>
                        {order.client}
                    </span>
                    {order.project && (
                        <span className={twMerge("ml-2", order.urgency === "high" && "bg-yellow-200 px-1 rounded font-semibold")}>
                            {order.project}
                        </span>
                    )}
                </div>
                <div className="text-xs text-slate-500 flex gap-4">
                    <span>Сроки: <b>{order.deadline}</b></span>
                    <span>Кол-во: <b>{order.quantity}</b></span>
                    {order.orderNumber && <span>Заказ: {order.orderNumber}</span>}
                </div>
            </div>

            {/* Workshops */}
            <div className="flex gap-1 items-center">
                {order.workshops.map((ws) => (
                    <div
                        key={ws.name}
                        className="flex flex-col items-center border border-slate-300 rounded px-2 py-1 min-w-[60px] text-xs"
                    >
                        <span className="text-[10px] text-slate-500">{ws.name}</span>
                        <span className="font-semibold">
                            {ws.ready}/{ws.total}
                        </span>
                        <span className="text-[9px] text-slate-400">готовых</span>
                    </div>
                ))}
                <div className="text-slate-400 text-xs px-1">...</div>
            </div>

            {/* AI Comment */}
            <div className="flex-1 min-w-[180px] text-xs text-slate-600 border-l border-slate-200 pl-3">
                {order.aiComment}
            </div>

            {/* Feedback */}
            <div className="flex-1 min-w-[150px] text-xs text-slate-500 border-l border-slate-200 pl-3">
                {order.feedbackComment || (
                    <span className="text-slate-300 italic">Нет комментариев</span>
                )}
            </div>
        </div>
    );
}
