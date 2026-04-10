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
import {DeptLoadEqualizer} from "./DeptLoadEqualizer";


interface IAiEntry {
    sort_weight: number;
    sort_position: number;
    ai_comment: string;
    feedback: string;
    weight_detail?: {
        deadline: number;
        progress: number;
        dept_load: number;
        adjustment?: number;
    };
}

interface IWeightCoefficients {
    k_deadline: number;
    k_progress: number;
    k_dept_load: number;
    k_feedback: number;
    k_revenue: number;
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
    // Этапы генерации — фиксированный список фаз, которые проходит задача
    const GENERATION_PHASES = [
        {key: 'Сбор данных...', label: 'Сбор данных'},
        {key: 'Расчёт весов...', label: 'Расчёт весов'},
        {key: 'Комментарии AI...', label: 'Комментарии AI'},
        {key: 'Построение графика...', label: 'Построение графика'},
        {key: 'Анализ настроек...', label: 'Анализ настроек'},
        {key: 'Генерация плана на день...', label: 'Генерация плана'},
    ] as const;
    // completedPhases — множество ключей фаз, которые завершены
    const [completedPhases, setCompletedPhases] = useState<Set<string>>(new Set());
    // failedPhase — ключ фазы, на которой произошла ошибка
    const [failedPhase, setFailedPhase] = useState<string | null>(null);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const [normsModal, setNormsModal] = useState<{productId: number; productName: string} | null>(null);
    // Ошибка генерации (например: "Не задан граф для типов: X") — показывается как баннер
    const [genError, setGenError] = useState<string | null>(null);

    const {data: weightsData} = useQuery({
        queryKey: ["weightCoefficients"],
        queryFn: () => $axios.get<IWeightCoefficients>('/plan/ai_plan/weights/').then(r => r.data),
    });
    const [localWeights, setLocalWeights] = useState<IWeightCoefficients | null>(null);
    const weights = localWeights ?? weightsData ?? {k_deadline: 15, k_progress: 25, k_dept_load: 35, k_feedback: 25, k_revenue: 0};

    // Бюджет слайдеров: сумма всех 4 коэффициентов = 100.
    // При движении одного слайдера остальные пропорционально уменьшаются.
    // Принцип "Быстро, Качественно, Недорого — выбери два":
    // нельзя выкрутить всё на максимум, нужно расставлять приоритеты.
    const BUDGET = 100;
    const SLIDER_KEYS: (keyof IWeightCoefficients)[] = ['k_deadline', 'k_progress', 'k_dept_load', 'k_feedback', 'k_revenue'];

    const redistributeWeights = useCallback((changedKey: keyof IWeightCoefficients, newValue: number, current: IWeightCoefficients): IWeightCoefficients => {
        const clamped = Math.max(0, Math.min(BUDGET, newValue));
        const remaining = BUDGET - clamped;
        const otherKeys = SLIDER_KEYS.filter(k => k !== changedKey);

        // Сумма остальных слайдеров ДО изменения
        const othersSum = otherKeys.reduce((s, k) => s + current[k], 0);

        const result = {...current, [changedKey]: clamped};

        if (othersSum > 0) {
            // Пропорционально уменьшаем/увеличиваем остальные
            let distributed = 0;
            otherKeys.forEach((k, i) => {
                if (i === otherKeys.length - 1) {
                    // Последний забирает остаток (чтобы сумма была точно 100)
                    result[k] = remaining - distributed;
                } else {
                    const share = Math.round((current[k] / othersSum) * remaining);
                    result[k] = share;
                    distributed += share;
                }
            });
        } else {
            // Все остальные на нуле — делим поровну
            const each = Math.floor(remaining / otherKeys.length);
            const extra = remaining - each * otherKeys.length;
            otherKeys.forEach((k, i) => {
                result[k] = each + (i < extra ? 1 : 0);
            });
        }

        return result;
    }, []);

    const saveWeights = useCallback((w: IWeightCoefficients) => {
        setLocalWeights(w);
        $axios.post('/plan/ai_plan/weights/update/', w).then(
            () => toast.success('Коэффициенты сохранены'),
            () => toast.error('Ошибка сохранения'),
        );
    }, []);

    const {data: deptsData} = useQuery({
        queryKey: ["departments"],
        queryFn: () => $axios.get<{departments: string[]}>('/plan/departments/').then(r => r.data),
    });
    const allDepartments: string[] = deptsData?.departments || [];

    const {data: normDeptsData} = useQuery({
        queryKey: ["departments-norms"],
        queryFn: () => $axios.get<{departments: string[]}>('/plan/departments/?norms=1').then(r => r.data),
    });
    const normDepartments: string[] = normDeptsData?.departments || [];

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
            const weightA = aiEntries[a[1].series_id]?.sort_weight ?? 500;
            const weightB = aiEntries[b[1].series_id]?.sort_weight ?? 500;
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

                    // Отмечаем все фазы до текущей как завершённые
                    if (phase) {
                        setCompletedPhases(prev => {
                            const next = new Set(prev);
                            for (const p of GENERATION_PHASES) {
                                if (p.key === phase) break;
                                next.add(p.key);
                            }
                            return next;
                        });
                    }

                    // Обновляем данные по мере обработки
                    if (current > 0) {
                        queryClient.invalidateQueries({queryKey: ["aiPlan"]});
                    }
                } else if (status === 'completed') {
                    stopPolling();
                    setGenerating(false);
                    // Отмечаем все фазы как завершённые, через 5с скрываем
                    setCompletedPhases(new Set(GENERATION_PHASES.map(p => p.key)));
                    setProgress(null);
                    queryClient.invalidateQueries({queryKey: ["aiPlan"]});
                    toast.success('AI план полностью готов!');
                    setTimeout(() => setCompletedPhases(new Set()), 5000);
                } else if (status === 'failed') {
                    stopPolling();
                    setGenerating(false);
                    // Запоминаем на какой фазе упало
                    setFailedPhase(phase || null);
                    setProgress(null);
                    const errMsg = error || 'Ошибка генерации плана';
                    setGenError(errMsg);
                    toast.error(errMsg);
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
        setGenError(null);
        setCompletedPhases(new Set());
        setFailedPhase(null);
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

            {/* Priority + Dept Load — side by side */}
            <div className="flex gap-4" style={{display: 'grid', gridTemplateColumns: '1fr 1fr'}}>
                {/* Weight Coefficients Sliders */}
                <div className="border border-slate-200 rounded-lg p-4">
                    <div className="text-xs text-slate-500 font-semibold mb-3">Настройка приоритетов</div>
                    <div className="grid grid-cols-2 gap-4">
                        {([
                            {key: 'k_deadline' as const, label: 'Сроки', desc: 'Влияние дедлайнов и просрочки'},
                            {key: 'k_progress' as const, label: 'Прогресс', desc: 'Дожимать почти готовые заказы'},
                            {key: 'k_dept_load' as const, label: 'Загрузка цехов', desc: 'Не давать цехам простаивать'},
                            {key: 'k_feedback' as const, label: 'Обратная связь', desc: 'Влияние комментариев менеджеров'},
                            {key: 'k_revenue' as const, label: 'Выручка', desc: 'Дорогие заказы первыми — быстрее прибыль'},
                        ]).map(({key, label, desc}) => (
                            <div key={key}>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs font-medium text-slate-700">{label}</span>
                                    <span className="text-xs text-slate-400 font-mono w-6 text-right">{weights[key]}</span>
                                </div>
                                <input
                                    type="range"
                                    min={0}
                                    max={100}
                                    value={weights[key]}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value);
                                        const next = redistributeWeights(key, val, weights);
                                        setLocalWeights(next);
                                    }}
                                    onMouseUp={() => saveWeights(weights)}
                                    onTouchEnd={() => saveWeights(weights)}
                                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                />
                                <div className="text-[10px] text-slate-400 mt-0.5">{desc}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Dept Load Equalizer */}
                <DeptLoadEqualizer departments={normDepartments} />
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

            {/* Этапы генерации — "связка сосисок" */}
            {(generating || completedPhases.size > 0 || failedPhase) && (
                <div className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center gap-0">
                        {GENERATION_PHASES.map((phase, idx) => {
                            const isCompleted = completedPhases.has(phase.key);
                            const isCurrent = generating && progress?.phase === phase.key;
                            const isFailed = failedPhase === phase.key;
                            // Ожидает — ещё не дошли до этого этапа
                            const isPending = !isCompleted && !isCurrent && !isFailed;

                            return (
                                <div key={phase.key} className="flex items-center flex-1 min-w-0">
                                    {/* Сосиска — этап */}
                                    <div
                                        className={twMerge(
                                            "flex-1 h-9 rounded-full flex items-center justify-center px-2 transition-all duration-500 relative overflow-hidden",
                                            isCompleted && "bg-green-500 text-white",
                                            isCurrent && "bg-blue-500 text-white",
                                            isFailed && "bg-red-500 text-white",
                                            isPending && "bg-slate-100 text-slate-400",
                                        )}
                                    >
                                        {/* Пульсация для текущего этапа */}
                                        {isCurrent && (
                                            <div className="absolute inset-0 bg-blue-400 rounded-full animate-pulse opacity-30" />
                                        )}
                                        <div className="flex items-center gap-1.5 z-10 whitespace-nowrap">
                                            {/* Иконка статуса */}
                                            {isCompleted && <span className="text-xs">&#10003;</span>}
                                            {isCurrent && <span className="text-xs animate-spin">&#9696;</span>}
                                            {isFailed && <span className="text-xs">&#10007;</span>}
                                            {isPending && <span className="text-xs text-slate-300">&#9679;</span>}
                                            <span className="text-[11px] font-medium truncate">{phase.label}</span>
                                        </div>
                                    </div>
                                    {/* Соединитель между сосисками */}
                                    {idx < GENERATION_PHASES.length - 1 && (
                                        <div className={twMerge(
                                            "w-2 h-1 shrink-0",
                                            isCompleted ? "bg-green-400" : "bg-slate-200"
                                        )} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    {/* Детали текущего этапа — количество обработанных заказов */}
                    {progress && progress.phase === 'Комментарии AI...' && progress.total > 0 && (
                        <div className="mt-2 text-xs text-slate-500 text-center">
                            Заказы прокомментированы: {progress.current} / {progress.total}
                        </div>
                    )}
                </div>
            )}

            {/* Баннер ошибки генерации (например: не задан граф для типов) */}
            {genError && (
                <div className="border border-red-300 bg-red-50 rounded-lg p-3 flex items-start gap-2">
                    <span className="text-red-600 text-sm flex-1">{genError}</span>
                    <button
                        onClick={() => setGenError(null)}
                        className="text-red-400 hover:text-red-600 text-xs font-bold shrink-0"
                    >
                        x
                    </button>
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

            {/* Orders Table — sticky left/right columns, scrollable departments */}
            <div className="border border-slate-200 rounded-lg text-xs overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                            <th className="sticky left-0 z-10 bg-slate-50 px-1 py-2 text-center w-[30px]">#</th>
                            <th className="sticky z-10 bg-slate-50 px-1 py-2 text-left w-[45px]" style={{left: 30}}>Фото</th>
                            <th className="sticky z-10 bg-slate-50 px-1 py-2 text-left w-[200px]" style={{left: 75}}>Изделие</th>
                            <th className="sticky z-10 bg-slate-50 px-1 py-2 text-left w-[65px] min-w-[65px] max-w-[65px]" style={{left: 275}}>Заказ</th>
                            <th className="sticky z-10 bg-slate-50 px-1 py-2 text-center w-[35px]" style={{left: 340}}>Кол</th>
                            <th className="sticky z-10 bg-slate-50 px-1 py-2 text-center w-[60px]" style={{left: 375}}>Срок</th>
                            <th className="sticky z-10 bg-slate-50 px-1 py-2 text-center w-[30px] border-r border-slate-200" style={{left: 435}}>Вес</th>
                            {allDepartments.filter(d => visibleDepts.has(d)).map(dept => (
                                <th key={dept} className="px-2 py-2 text-center whitespace-nowrap font-semibold border-l border-slate-200" style={{minWidth: 70}}>
                                    {dept}
                                </th>
                            ))}
                            <th className="sticky right-[120px] z-10 bg-slate-50 px-2 py-2 text-left border-l border-slate-200" style={{minWidth: 100}}>Обр. связь</th>
                            <th className="sticky right-0 z-10 bg-slate-50 px-2 py-2 text-left border-l border-slate-200" style={{minWidth: 120}}>AI комментарий</th>
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

    const rowBg = item.urgency === 1 ? "bg-red-50" : item.urgency === 2 ? "bg-yellow-50" : "bg-white";

    return (
        <tr className="border-t border-slate-100">
            {/* # */}
            <td className={twMerge("sticky left-0 z-10 px-1 py-1.5 text-slate-400 font-medium text-center w-[30px]", rowBg)}>
                {index}
            </td>
            {/* Фото */}
            <td className={twMerge("sticky z-10 px-1 py-1.5 w-[45px]", rowBg)} style={{left: 30}}>
                <div className="w-[36px] h-[36px] bg-slate-100 rounded overflow-hidden flex items-center justify-center">
                    {item.product_picture ? (
                        <img src={STATIC_URL + item.product_picture} alt="" className="w-full h-full object-cover"/>
                    ) : (
                        <span className="text-[8px] text-slate-300">---</span>
                    )}
                </div>
            </td>
            {/* Изделие */}
            <td className={twMerge("sticky z-10 px-1 py-1.5 w-[200px] max-w-[200px]", rowBg)} style={{left: 75}}>
                <div className="overflow-x-auto">
                    <div className="flex items-center gap-1 whitespace-nowrap">
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
                        <div className="text-[10px] text-slate-400 leading-tight whitespace-nowrap">{item.fabric_name}</div>
                    )}
                    {item.project && (
                        <span className={twMerge(
                            "text-[10px]",
                            item.urgency === 1 ? "text-red-600 font-semibold" : "text-slate-400"
                        )}>
                            {item.project}
                        </span>
                    )}
                </div>
            </td>
            {/* Заказ */}
            <td className={twMerge("sticky z-10 px-1 py-1.5 w-[65px] min-w-[65px] max-w-[65px]", rowBg)} style={{left: 275}}>
                <span className={twMerge(
                    "text-xs truncate block",
                    item.urgency === 1 && "bg-red-200 px-1 rounded font-semibold text-red-800"
                )}>
                    {item.order}
                </span>
            </td>
            {/* Кол */}
            <td className={twMerge("sticky z-10 px-1 py-1.5 text-center font-semibold w-[35px]", rowBg)} style={{left: 340}}>
                {item.quantity}
            </td>
            {/* Срок */}
            <td className={twMerge("sticky z-10 px-1 py-1.5 text-center w-[60px]", rowBg)} style={{left: 375}}>
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
            {/* Вес */}
            <td
                className={twMerge("sticky z-10 px-1 py-1.5 text-center w-[30px] border-r border-slate-200 cursor-help", rowBg)}
                style={{left: 435}}
                title={aiEntry?.weight_detail
                    ? `Сроки: ${aiEntry.weight_detail.deadline ?? '—'}\nПрогресс: ${aiEntry.weight_detail.progress ?? '—'}\nЦеха: ${aiEntry.weight_detail.dept_load ?? '—'}${aiEntry.weight_detail.adjustment ? `\nAI корр.: ${aiEntry.weight_detail.adjustment > 0 ? '+' : ''}${aiEntry.weight_detail.adjustment}` : ''}`
                    : undefined}
            >
                <span className={twMerge(
                    "text-[10px] font-semibold",
                    (aiEntry?.sort_weight ?? 500) >= 900 ? "text-red-600" :
                    (aiEntry?.sort_weight ?? 500) >= 700 ? "text-yellow-600" : "text-slate-400"
                )}>
                    {aiEntry?.sort_weight ?? "—"}
                </span>
            </td>

            {/* Department cells — these scroll */}
            {allDepartments.filter(d => visibleDepts.has(d)).map(dept => {
                const d = item.assignments[dept] || empty;
                if (d.all === 0) return (
                    <td key={dept} className={twMerge("px-2 py-1.5 text-center text-slate-200 border-l border-slate-200", rowBg)} style={{minWidth: 70}}>—</td>
                );
                const done = d.ready === d.all;
                return (
                    <td key={dept} className={twMerge("px-2 py-1.5 text-center border-l border-slate-200", rowBg)} style={{minWidth: 70}}>
                        <span className={twMerge(
                            "text-[11px] font-medium",
                            done ? "text-green-600" : d.ready > 0 ? "text-yellow-600" : "text-slate-500"
                        )}>
                            {d.ready}/{d.all}
                        </span>
                    </td>
                );
            })}

            {/* Обр. связь */}
            <td className={twMerge("sticky right-[120px] z-10 border-l border-slate-200 px-2 py-1.5", rowBg)} style={{minWidth: 100}}>
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
            {/* AI комментарий */}
            <td className={twMerge(
                "sticky right-0 z-10 border-l border-slate-200 px-2 py-1.5 text-[11px] leading-tight",
                rowBg,
                item.urgency === 1 ? "text-red-700" :
                    item.urgency === 2 ? "text-yellow-700" : "text-slate-600"
            )} style={{minWidth: 120}}>
                {aiEntry?.ai_comment || (
                    <span className="text-slate-300 italic">—</span>
                )}
            </td>
        </tr>
    );
}
