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
import {NormsTable} from "./NormsTable";
import {WorkersTable} from "./WorkersTable";
import {ProductNormsModal} from "./ProductNormsModal";


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
    const [progress, setProgress] = useState<{current: number; total: number; phase: string} | null>(null);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const [normsModal, setNormsModal] = useState<{productId: number; productName: string} | null>(null);

    const {data: deptsData} = useQuery({
        queryKey: ["departments"],
        queryFn: () => $axios.get<{departments: string[]}>('/plan/departments/').then(r => r.data),
    });
    const allDepartments: string[] = deptsData?.departments || [];

    const [hiddenDepts, setHiddenDepts] = useState<Set<string>>(new Set());
    const visibleDepts = useMemo(
        () => new Set(allDepartments.filter(d => !hiddenDepts.has(d))),
        [allDepartments, hiddenDepts]
    );

    const toggleDept = useCallback((dept: string) => {
        setHiddenDepts(prev => {
            const next = new Set(prev);
            if (next.has(dept)) next.delete(dept);
            else next.add(dept);
            return next;
        });
    }, []);

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
            const weightA = aiEntries[a[1].series_id]?.sort_weight ?? 50;
            const weightB = aiEntries[b[1].series_id]?.sort_weight ?? 50;
            if (weightA !== weightB) return weightB - weightA;
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

    const stopPolling = useCallback(() => {
        if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
        }
    }, []);

    const startPolling = useCallback(() => {
        stopPolling();
        setGenerating(true);

        const poll = () => {
            $axios.get('/plan/ai_plan/progress/').then(res => {
                const {status, phase, current, total, error} = res.data;

                if (status === 'running') {
                    setProgress({current, total, phase});
                    // Обновляем данные по мере обработки
                    if (current > 0) {
                        queryClient.invalidateQueries({queryKey: ["aiPlan"]});
                    }
                } else if (status === 'completed') {
                    stopPolling();
                    setGenerating(false);
                    setProgress(null);
                    queryClient.invalidateQueries({queryKey: ["aiPlan"]});
                    toast.success('AI план полностью готов!');
                } else if (status === 'failed') {
                    stopPolling();
                    setGenerating(false);
                    setProgress(null);
                    toast.error(error || 'Ошибка генерации плана');
                } else if (status === 'cancelled') {
                    stopPolling();
                    setGenerating(false);
                    setProgress(null);
                    queryClient.invalidateQueries({queryKey: ["aiPlan"]});
                    toast.info('Генерация отменена');
                } else {
                    // idle — задача не запущена
                    stopPolling();
                    setGenerating(false);
                    setProgress(null);
                }
            });
        };

        poll(); // первый запрос сразу
        pollRef.current = setInterval(poll, 5000);
    }, [queryClient, stopPolling]);

    // При маунте — проверяем, не идёт ли уже генерация
    useEffect(() => {
        $axios.get('/plan/ai_plan/progress/').then(res => {
            if (res.data.status === 'running') {
                startPolling();
            }
        });
        return stopPolling;
    }, [startPolling, stopPolling]);

    const handleGenerate = useCallback(() => {
        setGenerating(true);
        setProgress({current: 0, total: 0, phase: 'Запуск...'});

        $axios.post('/plan/ai_plan/generate/').then(res => {
            if (res.data.status === 'already_running' || res.data.status === 'started') {
                startPolling();
            }
        }).catch(err => {
            toast.error(err.response?.data?.error || 'Ошибка запуска генерации');
            setGenerating(false);
            setProgress(null);
        });
    }, [startPolling]);

    const handleCancel = useCallback(() => {
        $axios.post('/plan/ai_plan/cancel/').then(() => {
            toast.info('Отмена генерации...');
        });
    }, []);

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

            {/* Norms Table */}
            <NormsTable />

            {/* Workers Table */}
            <WorkersTable />

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
                <div className="font-semibold text-slate-900 mb-2">AI план:</div>
                {aiSummary ? (
                    <div className="whitespace-pre-line leading-relaxed">{aiSummary}</div>
                ) : (
                    <span className="text-slate-400 italic">Нажмите "Сгенерировать план" для анализа</span>
                )}
            </div>

            {/* Generate / Cancel button */}
            {generating ? (
                <Btn
                    onClick={handleCancel}
                    className="border border-orange-400 bg-orange-100 text-orange-800 rounded-lg py-2 font-semibold"
                >
                    Отменить генерацию
                </Btn>
            ) : (
                <Btn
                    onClick={handleGenerate}
                    className="border border-blue-400 bg-blue-100 text-blue-800 rounded-lg py-2 font-semibold"
                >
                    Сгенерировать AI план
                </Btn>
            )}

            {/* Progress bar */}
            {progress && (
                <div className="border border-slate-200 rounded-lg p-3">
                    <div className="flex justify-between text-xs text-slate-600 mb-1.5">
                        <span className="font-medium">{progress.phase}</span>
                        <span>
                            {progress.total > 0
                                ? `${progress.current} / ${progress.total} заказов`
                                : 'Ожидание ответа AI...'
                            }
                        </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                        <div
                            className="bg-blue-500 h-full rounded-full transition-all duration-500 ease-out"
                            style={{
                                width: progress.total > 0
                                    ? `${Math.round((progress.current / progress.total) * 100)}%`
                                    : '100%',
                                animation: progress.total === 0 ? 'pulse 2s ease-in-out infinite' : undefined,
                                opacity: progress.total === 0 ? 0.5 : 1,
                            }}
                        />
                    </div>
                    {progress.total > 0 && (
                        <div className="text-[10px] text-slate-400 mt-1 text-right">
                            {Math.round((progress.current / progress.total) * 100)}%
                        </div>
                    )}
                </div>
            )}

            {/* Reset button */}
            <Btn
                onClick={() => {
                    if (!confirm('Сбросить все AI комментарии, веса и план?')) return;
                    $axios.post('/plan/ai_plan/reset/').then(res => {
                        queryClient.invalidateQueries({queryKey: ["aiPlan"]});
                        toast.success(`Сброшено ${res.data.reset} записей`);
                    }).catch(() => toast.error('Ошибка сброса'));
                }}
                disabled={generating}
                className="border border-red-300 bg-red-50 text-red-600 rounded-lg py-2 text-sm"
            >
                Сбросить AI данные
            </Btn>

            {/* Loading */}
            {isFetching && (
                <div className="text-center text-slate-400 animate-pulse py-2">Загрузка...</div>
            )}

            {/* Department toggles */}
            <div className="flex gap-1.5 flex-wrap items-center">
                <span className="text-xs text-slate-500 mr-1">Цеха:</span>
                {allDepartments.map(dept => (
                    <button
                        key={dept}
                        onClick={() => toggleDept(dept)}
                        className={twMerge(
                            "px-2.5 py-1 rounded text-xs border transition-colors",
                            visibleDepts.has(dept)
                                ? "bg-blue-100 border-blue-300 text-blue-800"
                                : "bg-slate-50 border-slate-200 text-slate-400"
                        )}
                    >
                        {dept}
                    </button>
                ))}
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="text-xs border-collapse min-w-full">
                    <thead>
                        <tr className="bg-slate-50 text-slate-600">
                            <th className="px-2 py-2 text-left font-semibold w-8">#</th>
                            <th className="px-2 py-2 text-left font-semibold w-[50px]">Фото</th>
                            <th className="px-2 py-2 text-left font-semibold min-w-[180px]">Изделие</th>
                            <th className="px-2 py-2 text-left font-semibold w-[90px]">Заказ</th>
                            <th className="px-2 py-2 text-center font-semibold w-[40px]">Кол</th>
                            <th className="px-2 py-2 text-center font-semibold w-[70px]">Срок</th>
                            <th className="px-2 py-2 text-center font-semibold w-[35px]">Вес</th>
                            {allDepartments.filter(d => visibleDepts.has(d)).map(dept => (
                                <th key={dept} className="px-2 py-2 text-center font-semibold whitespace-nowrap">
                                    {dept}
                                </th>
                            ))}
                            <th className="px-2 py-2 text-left font-semibold min-w-[120px]">Обратная связь</th>
                            <th className="px-2 py-2 text-left font-semibold min-w-[150px]">AI комментарий</th>
                        </tr>
                    </thead>
                    <tbody>
                        {entries.map(([key, item], idx) => (
                            <OrderRow
                                key={key}
                                item={item}
                                index={idx + 1}
                                aiEntry={aiEntries[item.series_id]}
                                onFeedbackSave={saveFeedback}
                                visibleDepts={visibleDepts}
                                allDepartments={allDepartments}
                                onOpenNorms={(id, name) => setNormsModal({productId: id, productName: name})}
                            />
                        ))}
                    </tbody>
                </table>
            </div>

            <ProductNormsModal
                productId={normsModal?.productId ?? null}
                productName={normsModal?.productName ?? ""}
                isOpen={normsModal !== null}
                onClose={() => setNormsModal(null)}
            />
        </div>
    );
};

function OrderRow({item, index, aiEntry, onFeedbackSave, visibleDepts, allDepartments, onOpenNorms}: {
    item: IPlanDataRow;
    index: number;
    aiEntry?: IAiEntry;
    onFeedbackSave: (seriesId: string, feedback: string) => void;
    visibleDepts: Set<string>;
    allDepartments: string[];
    onOpenNorms: (productId: number, productName: string) => void;
}) {
    const [feedback, setFeedback] = useState(aiEntry?.feedback ?? "");
    const empty = {all: 0, ready: 0, await: 0};

    const rowBg = item.urgency === 1 ? "bg-red-50" : item.urgency === 2 ? "bg-yellow-50" : "";

    return (
        <tr className={twMerge("border-t border-slate-100 hover:bg-slate-50/50", rowBg)}>
            {/* # */}
            <td className="px-2 py-1.5 text-slate-400 font-medium">{index}</td>

            {/* Photo */}
            <td className="px-2 py-1.5">
                <div className="w-[40px] h-[40px] bg-slate-100 rounded overflow-hidden flex items-center justify-center">
                    {item.product_picture ? (
                        <img src={STATIC_URL + item.product_picture} alt="" className="w-full h-full object-cover"/>
                    ) : (
                        <span className="text-[8px] text-slate-300">---</span>
                    )}
                </div>
            </td>

            {/* Product */}
            <td className="px-2 py-1.5">
                <div className="flex items-center gap-1">
                    <span className="font-medium text-slate-800 leading-tight">
                        {item.product_name}
                    </span>
                    <button
                        onClick={() => onOpenNorms(item.product_id, item.product_name)}
                        className="text-[9px] text-blue-400 hover:text-blue-600 shrink-0"
                        title="Нормативы изделия"
                    >
                        [н]
                    </button>
                </div>
                {item.fabric_name && (
                    <div className="text-[10px] text-slate-400 leading-tight">{item.fabric_name}</div>
                )}
                {item.project && (
                    <span className={twMerge(
                        "text-[10px]",
                        item.urgency === 1 ? "text-red-600 font-semibold" : "text-slate-400"
                    )}>
                        {item.project}
                    </span>
                )}
            </td>

            {/* Order number */}
            <td className="px-2 py-1.5">
                <span className={twMerge(
                    "text-xs",
                    item.urgency === 1 && "bg-red-200 px-1 rounded font-semibold text-red-800"
                )}>
                    {item.order}
                </span>
            </td>

            {/* Quantity */}
            <td className="px-2 py-1.5 text-center font-semibold">{item.quantity}</td>

            {/* Deadline */}
            <td className="px-2 py-1.5 text-center">
                {item.date ? (
                    <span className={twMerge(
                        "text-[10px]",
                        item.urgency === 1 ? "text-red-600 font-semibold" : "text-slate-600"
                    )}>
                        {item.date}
                    </span>
                ) : (
                    <span className="text-slate-300">—</span>
                )}
            </td>

            {/* Weight */}
            <td className="px-2 py-1.5 text-center">
                <span className={twMerge(
                    "text-[10px] font-semibold",
                    (aiEntry?.sort_weight ?? 50) >= 90 ? "text-red-600" :
                    (aiEntry?.sort_weight ?? 50) >= 70 ? "text-yellow-600" : "text-slate-400"
                )}>
                    {aiEntry?.sort_weight ?? "—"}
                </span>
            </td>

            {/* Department columns */}
            {allDepartments.filter(d => visibleDepts.has(d)).map(dept => {
                const d = item.assignments[dept] || empty;
                if (d.all === 0) return <td key={dept} className="px-1.5 py-1.5 text-center text-slate-200">—</td>;
                const done = d.ready === d.all;
                return (
                    <td key={dept} className="px-1.5 py-1.5 text-center">
                        <span className={twMerge(
                            "text-[11px] font-medium",
                            done ? "text-green-600" : d.ready > 0 ? "text-yellow-600" : "text-slate-500"
                        )}>
                            {d.ready}/{d.all}
                        </span>
                    </td>
                );
            })}

            {/* Feedback */}
            <td className="px-2 py-1.5">
                <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    onBlur={() => onFeedbackSave(item.series_id, feedback)}
                    placeholder="..."
                    rows={1}
                    className={twMerge(
                        "w-full text-[11px] outline-none resize-none bg-transparent leading-tight",
                        feedback ? "text-slate-700" : "text-slate-300"
                    )}
                />
            </td>

            {/* AI Comment */}
            <td className={twMerge(
                "px-2 py-1.5 text-[11px] leading-tight",
                item.urgency === 1 ? "text-red-700" :
                    item.urgency === 2 ? "text-yellow-700" : "text-slate-600"
            )}>
                {aiEntry?.ai_comment || (
                    <span className="text-slate-300 italic">—</span>
                )}
            </td>
        </tr>
    );
}
