import {useState, useMemo, useCallback, useEffect, useRef} from "react";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {Btn} from "@/shared/ui/buttons/Btn.tsx";
import {twMerge} from "tailwind-merge";
import {planService} from "@/widgets/plan/model/api.ts";
import {usePlanProject} from "@/shared/state/plan/planProject.ts";
import {usePlanManager} from "@/shared/state/plan/planManagers.ts";
import {usePlanAgent} from "@/shared/state/plan/planAgent.ts";
import type {IPlanDataRow} from "@/entities/plan";
import {STATIC_URL} from "@/shared/consts/serverConfig.ts";
import {$axios} from "@/shared/api";
import {toast} from "sonner";

const DEPARTMENTS = ["Конструктора", "Сборка", "Пошив", "Малярка", "Обивка", "Упаковка"];

interface IAiEntry {
    sort_weight: number;
    sort_position: number;
    ai_comment: string;
    feedback: string;
}

interface IAiPlanData {
    entries: Record<string, IAiEntry>;
    config: {
        base_prompt: string;
        ai_summary: string;
    };
}

export const AiPlanPage = () => {
    const planProject = usePlanProject((s) => s.planProject);
    const planManager = usePlanManager((s) => s.planManager);
    const planAgent = usePlanAgent((s) => s.planAgent);
    const queryClient = useQueryClient();

    const [prompt, setPrompt] = useState("");
    const [generating, setGenerating] = useState(false);

    const {data: planData, isFetching} = useQuery({
        queryKey: ["planTable", planProject, planManager, planAgent],
        queryFn: () =>
            planService.getPlanTable({
                project: planProject === "Все проекты" ? null : planProject,
                manager_id: planManager,
                agent_id: planAgent,
            }),
    });

    const {data: aiData} = useQuery<IAiPlanData>({
        queryKey: ["aiPlan"],
        queryFn: () => $axios.get<IAiPlanData>('/plan/ai_plan/').then(r => r.data),
    });

    const [basePrompt, setBasePrompt] = useState<string | null>(null);
    const currentPrompt = basePrompt ?? aiData?.config?.base_prompt ?? "";
    const aiSummary = aiData?.config?.ai_summary || "";
    const aiEntries = aiData?.entries || {};

    const entries = useMemo(() => {
        const items = Object.entries(planData?.data || {});
        return items.sort((a, b) => {
            const posA = aiEntries[a[1].series_id]?.sort_position ?? 9999;
            const posB = aiEntries[b[1].series_id]?.sort_position ?? 9999;
            if (posA !== posB) return posA - posB;
            if (!a[1].date && !b[1].date) return 0;
            if (!a[1].date) return 1;
            if (!b[1].date) return -1;
            return new Date(a[1].date).getTime() - new Date(b[1].date).getTime();
        });
    }, [planData, aiEntries]);

    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const saveBasePrompt = useCallback((value: string) => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            $axios.post('/plan/ai_plan/update_config/', {base_prompt: value}).then(
                () => toast.success('Промпт сохранён'),
                () => toast.error('Ошибка сохранения')
            );
        }, 1000);
    }, []);

    useEffect(() => {
        return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
    }, []);

    const handleGenerate = useCallback(() => {
        setGenerating(true);
        toast.promise(
            $axios.post('/plan/ai_plan/generate/').then(res => {
                queryClient.invalidateQueries({queryKey: ["aiPlan"]});
                return res;
            }).finally(() => setGenerating(false)),
            {
                loading: 'AI анализирует заказы... (может занять до 2 минут)',
                success: (res) => `Готово! Обработано ${res.data.entries_count} заказов`,
                error: (err) => err.response?.data?.error || 'Ошибка генерации',
            }
        );
    }, [queryClient]);

    const handlePrompt = useCallback(() => {
        if (!prompt.trim()) return;
        setGenerating(true);
        toast.promise(
            $axios.post('/plan/ai_plan/prompt/', {prompt: prompt.trim()}).then(res => {
                queryClient.invalidateQueries({queryKey: ["aiPlan"]});
                setPrompt("");
                return res;
            }).finally(() => setGenerating(false)),
            {
                loading: 'AI обрабатывает запрос...',
                success: (res) => res.data.ai_response || `Обновлено ${res.data.updated} заказов`,
                error: (err) => err.response?.data?.error || 'Ошибка обработки',
            }
        );
    }, [prompt, queryClient]);

    const saveFeedback = useCallback((seriesId: string, feedback: string) => {
        $axios.post('/plan/ai_plan/update_feedback/', {series_id: seriesId, feedback});
    }, []);

    return (
        <div className="max-w-dvw bg-white p-4 flex flex-col gap-4">
            {/* Base Prompt */}
            <div className="border border-slate-200 rounded-lg p-4">
                <label className="text-xs text-slate-500 font-semibold mb-1 block">
                    Базовый промпт (о фабрике, сотрудниках, принципах планирования)
                </label>
                <textarea
                    value={currentPrompt}
                    onChange={(e) => {
                        setBasePrompt(e.target.value);
                        saveBasePrompt(e.target.value);
                    }}
                    rows={4}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 resize-y"
                />
            </div>

            {/* Input + Voice */}
            <div className="flex gap-2 items-center">
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handlePrompt()}
                    disabled={generating}
                    placeholder="Например: заказ для Рыжий очень важен, поднять приоритет..."
                    className="flex-1 border border-slate-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-blue-400 disabled:opacity-50"
                />
                <Btn
                    onClick={handlePrompt}
                    disabled={generating || !prompt.trim()}
                    className="border border-slate-300 rounded-lg px-4 py-3 text-sm disabled:opacity-50"
                >
                    {generating ? "..." : "Отправить"}
                </Btn>
            </div>

            {/* AI Summary */}
            <div className="border border-slate-200 rounded-lg bg-blue-50 p-4 text-sm text-slate-700">
                <span className="font-semibold text-slate-900">AI: </span>
                {aiSummary || <span className="text-slate-400 italic">Нажмите "Сгенерировать план" для анализа</span>}
            </div>

            {/* Generate button */}
            <Btn
                onClick={handleGenerate}
                disabled={generating}
                className={twMerge(
                    "border border-blue-400 bg-blue-100 text-blue-800 rounded-lg py-2 font-semibold",
                    generating && "opacity-50 cursor-wait"
                )}
            >
                {generating ? "Генерация..." : "Сгенерировать AI план"}
            </Btn>

            {/* Loading */}
            {isFetching && (
                <div className="text-center text-slate-400 animate-pulse py-2">Загрузка...</div>
            )}

            {/* Orders */}
            <div className="flex flex-col gap-3">
                {entries.map(([key, item], idx) => (
                    <OrderCard
                        key={key}
                        item={item}
                        index={idx + 1}
                        aiEntry={aiEntries[item.series_id]}
                        onFeedbackSave={saveFeedback}
                    />
                ))}
            </div>
        </div>
    );
};

function OrderCard({item, index, aiEntry, onFeedbackSave}: {
    item: IPlanDataRow;
    index: number;
    aiEntry?: IAiEntry;
    onFeedbackSave: (seriesId: string, feedback: string) => void;
}) {
    const [feedback, setFeedback] = useState(aiEntry?.feedback ?? "");
    const urgencyMap = {
        1: "border-red-400 bg-red-50",
        2: "border-yellow-300 bg-yellow-50",
        3: "border-slate-200 bg-white",
    };

    const empty = {all: 0, ready: 0, await: 0};

    return (
        <div
            className={twMerge(
                "border rounded-lg p-3 flex gap-3 items-stretch",
                urgencyMap[item.urgency]
            )}
        >
            {/* Left: meta + image */}
            <div className="flex flex-col items-center gap-1 min-w-[80px] text-[10px] text-slate-500">
                <div>важность: <b>{aiEntry?.sort_weight ?? "—"}</b></div>
                <div>поз: <b>#{aiEntry?.sort_position ?? index}</b></div>
                <div className="w-[70px] h-[70px] bg-slate-200 rounded flex items-center justify-center text-[9px] text-slate-400 overflow-hidden">
                    {item.product_picture ? (
                        <img src={STATIC_URL + item.product_picture} alt="" className="w-full h-full object-cover"/>
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
                    {item.product_name}
                    {item.fabric_name && ` + ${item.fabric_name}`}
                </div>
                <div className="text-xs text-slate-600">
                    <span className={twMerge(item.urgency === 1 && "bg-red-200 px-1 rounded font-semibold")}>
                        {item.order}
                    </span>
                    {item.project && (
                        <span className={twMerge("ml-2", item.urgency === 1 && "bg-yellow-200 px-1 rounded font-semibold")}>
                            {item.project}
                        </span>
                    )}
                </div>
                <div className="text-xs text-slate-500 flex gap-4">
                    <span>Сроки: <b>{item.date || "—"}</b></span>
                    <span>Кол-во: <b>{item.quantity}</b></span>
                    <span>Серия: {item.series_id}</span>
                </div>
            </div>

            {/* Workshops */}
            <div className="flex gap-1 items-center flex-wrap">
                {DEPARTMENTS.map((dept) => {
                    const d = item.assignments[dept] || empty;
                    return (
                        <div
                            key={dept}
                            className="flex flex-col items-center border border-slate-300 rounded px-2 py-1 min-w-[60px] text-xs"
                        >
                            <span className="text-[10px] text-slate-500">{dept}</span>
                            <span className="font-semibold">
                                {d.ready}/{d.all}
                            </span>
                            <span className="text-[9px] text-slate-400">готовых</span>
                        </div>
                    );
                })}
            </div>

            {/* AI Comment */}
            <div className={twMerge(
                "flex-1 min-w-[180px] text-xs border-l pl-3",
                item.urgency === 1 ? "text-red-700 border-red-200" :
                    item.urgency === 2 ? "text-yellow-700 border-yellow-200" :
                        "text-slate-600 border-slate-200"
            )}>
                {aiEntry?.ai_comment || (
                    <span className="text-slate-300 italic">Нажмите "Сгенерировать"</span>
                )}
            </div>

            {/* Feedback */}
            <div className="flex-1 min-w-[150px] border-l border-slate-200 pl-3">
                <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    onBlur={() => onFeedbackSave(item.series_id, feedback)}
                    placeholder="Комментарий обратной связи..."
                    className={twMerge(
                        "w-full h-full text-xs outline-none resize-none bg-transparent",
                        feedback ? "text-slate-700" : "text-slate-300"
                    )}
                />
            </div>
        </div>
    );
}
