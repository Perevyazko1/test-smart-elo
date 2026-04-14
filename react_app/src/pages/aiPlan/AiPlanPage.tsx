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
import {BatchBonusTable} from "./BatchBonusTable";
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
    k_dept_load: number;
    k_feedback: number;
    k_revenue: number;
    setup_minutes: number;
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
    const [listening, setListening] = useState(false);
    const recognitionRef = useRef<any>(null);
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

    // Этапы обработки промпт-запроса через n8n (GPT → поиск → обновление → пересчёт)
    const PROMPT_PHASES = [
        {key: 'gpt', label: 'Анализ запроса (GPT)'},
        {key: 'search', label: 'Поиск заказов'},
        {key: 'update', label: 'Сохранение'},
        {key: 'weights', label: 'Расчёт весов'},
        {key: 'batch', label: 'AI корректировка'},
        {key: 'chart', label: 'Пересчёт графика'},
    ] as const;
    // promptPhase — текущий этап обработки промпта (null = не обрабатывается)
    const [promptPhase, setPromptPhase] = useState<string | null>(null);
    // promptCompletedPhases — завершённые этапы промпт-обработки
    const [promptCompletedPhases, setPromptCompletedPhases] = useState<Set<string>>(new Set());
    // promptFailed — этап на котором упала обработка промпта
    const [promptFailed, setPromptFailed] = useState<string | null>(null);
    const promptTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const {data: weightsData} = useQuery({
        queryKey: ["weightCoefficients"],
        queryFn: () => $axios.get<IWeightCoefficients>('/plan/ai_plan/weights/').then(r => r.data),
    });
    const [localWeights, setLocalWeights] = useState<IWeightCoefficients | null>(null);
    const weights = localWeights ?? weightsData ?? {k_deadline: 15, k_dept_load: 35, k_feedback: 25, k_revenue: 50, setup_minutes: 0};

    // Слайдеры приоритетов — каждый независим (0-100).
    // Формула нормализует: weight = (S1×K1 + S2×K2 + ...) / (100 × сумма_K),
    // поэтому важно соотношение слайдеров, а не абсолютные значения.

    const saveWeights = useCallback((w: IWeightCoefficients) => {
        setLocalWeights(w);
        $axios.post('/plan/ai_plan/weights/update/', w).then(
            () => toast.success('Коэффициенты сохранены'),
            () => toast.error('Ошибка сохранения'),
        );
    }, []);

    const {data: deptsData} = useQuery({
        queryKey: ["departments-norms"],
        queryFn: () => $axios.get<{departments: string[]}>('/plan/departments/?norms=1').then(r => r.data),
    });
    const allDepartments: string[] = deptsData?.departments || [];
    const normDepartments = allDepartments;

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

    // Нормативы по изделиям: {product_id: {dept: hours}} — загружаются батчем
    const productIds = useMemo(() => {
        return Object.values(planData?.data || {}).map(r => r.product_id).filter(Boolean);
    }, [planData]);
    const {data: batchNormsData} = useQuery<{norms: Record<number, Record<string, number>>}>({
        queryKey: ["productNormsBatch", productIds],
        queryFn: () => $axios.post<{norms: Record<number, Record<string, number>>}>('/plan/product_norms/batch/', {product_ids: productIds}).then(r => r.data),
        enabled: productIds.length > 0,
    });
    const productNorms = batchNormsData?.norms || {};

    // Сохранение переопределения норматива для конкретного изделия
    const normSaveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
    const saveProductNorm = useCallback((productId: number, dept: string, value: number) => {
        const key = `${productId}-${dept}`;
        if (normSaveTimers.current[key]) clearTimeout(normSaveTimers.current[key]);
        normSaveTimers.current[key] = setTimeout(() => {
            $axios.post(`/plan/product_norms/${productId}/update/`, {
                overrides: {[dept]: value}
            }).then(
                () => toast.success('Норматив сохранён'),
                () => toast.error('Ошибка сохранения')
            );
        }, 1000);
    }, []);

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

    // Вспомогательная функция: последовательно переключает этапы промпт-обработки по таймеру
    const advancePromptPhases = useCallback((phaseIndex: number, resolve: () => void) => {
        if (phaseIndex >= PROMPT_PHASES.length) {
            resolve();
            return;
        }
        const phase = PROMPT_PHASES[phaseIndex];
        // Отмечаем предыдущий этап как завершённый
        if (phaseIndex > 0) {
            setPromptCompletedPhases(prev => new Set([...prev, PROMPT_PHASES[phaseIndex - 1].key]));
        }
        setPromptPhase(phase.key);
        // Задержка между этапами: GPT-анализ и AI корректировка дольше, остальные быстрее
        const delays: Record<string, number> = {gpt: 3000, search: 1500, update: 1000, weights: 2000, batch: 5000, chart: 3000};
        const delay = delays[phase.key] || 2000;
        promptTimerRef.current = setTimeout(() => advancePromptPhases(phaseIndex + 1, resolve), delay);
    }, []);

    const handlePrompt = useCallback(() => {
        if (!prompt.trim()) return;
        setGenerating(true);
        setPromptPhase(null);
        setPromptCompletedPhases(new Set());
        setPromptFailed(null);

        // Запускаем имитацию этапов параллельно с реальным запросом
        const phasesDone = new Promise<void>(resolve => advancePromptPhases(0, resolve));

        $axios.post('/plan/ai_plan/prompt/', {prompt: prompt.trim()}).then(async (res) => {
            // Ждём пока анимация этапов догонит реальный ответ
            await phasesDone;
            // Отмечаем все этапы как завершённые
            setPromptCompletedPhases(new Set(PROMPT_PHASES.map(p => p.key)));
            setPromptPhase(null);
            queryClient.invalidateQueries({queryKey: ["aiPlan"]});
            setPrompt("");
            toast.success(res.data.ai_response || `Обновлено ${res.data.updated} заказов`);
            // Скрываем индикатор через 3 секунды
            setTimeout(() => {
                setPromptCompletedPhases(new Set());
            }, 3000);
        }).catch(async (err) => {
            // Останавливаем таймер этапов при ошибке
            if (promptTimerRef.current) clearTimeout(promptTimerRef.current);
            // Отмечаем текущий этап как failed
            setPromptFailed(promptPhase || 'gpt');
            toast.error(err.response?.data?.error || 'Ошибка обработки');
            // Скрываем индикатор через 5 секунд
            setTimeout(() => {
                setPromptFailed(null);
                setPromptCompletedPhases(new Set());
                setPromptPhase(null);
            }, 5000);
        }).finally(() => setGenerating(false));
    }, [prompt, queryClient, advancePromptPhases, promptPhase]);

    // Голосовой ввод через Web Speech API (Chrome/Edge)
    const toggleVoice = useCallback(() => {
        if (listening) {
            recognitionRef.current?.stop();
            return;
        }
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            toast.error('Голосовой ввод не поддерживается в этом браузере (нужен Chrome или Edge)');
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.lang = 'ru-RU';
        recognition.continuous = true;
        recognition.interimResults = true;
        recognitionRef.current = recognition;

        // Сохраняем текущий текст инпута как префикс — голос дополняет, а не заменяет
        const prefix = prompt ? prompt.trim() + ' ' : '';
        let finalText = '';
        recognition.onresult = (event: any) => {
            let interim = '';
            for (let i = 0; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    finalText += event.results[i][0].transcript + ' ';
                } else {
                    interim += event.results[i][0].transcript;
                }
            }
            setPrompt((prefix + finalText + interim).trim());
        };
        recognition.onend = () => setListening(false);
        recognition.onerror = (e: any) => {
            if (e.error !== 'aborted') toast.error('Ошибка микрофона: ' + e.error);
            setListening(false);
        };
        recognition.start();
        setListening(true);
    }, [listening, prompt]);

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

            {/* Batch Bonus Table — настил по цехам */}
            <BatchBonusTable />

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
                            {key: 'k_dept_load' as const, label: 'Загрузка цехов', desc: 'Не давать цехам простаивать'},
                            {key: 'k_feedback' as const, label: 'Обратная связь', desc: 'Влияние комментариев менеджеров'},
                            {key: 'k_revenue' as const, label: 'Выручка', desc: '← прогресс (дожимать готовые) | выручка (дорогие первыми) →'},
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
                                        const val = Math.max(0, Math.min(100, parseInt(e.target.value)));
                                        setLocalWeights({...weights, [key]: val});
                                    }}
                                    onMouseUp={() => saveWeights(weights)}
                                    onTouchEnd={() => saveWeights(weights)}
                                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                />
                                <div className="text-[10px] text-slate-400 mt-0.5">{desc}</div>
                            </div>
                        ))}
                    </div>
                    {/* Глобальное время переключения */}
                    <div className="mt-4 pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-medium text-violet-700">Переключение (мин)</span>
                            <input
                                type="number"
                                step="1"
                                min="0"
                                max="120"
                                value={weights.setup_minutes ?? 0}
                                onChange={(e) => {
                                    const val = Math.max(0, Math.min(120, parseFloat(e.target.value) || 0));
                                    setLocalWeights({...weights, setup_minutes: val});
                                }}
                                onBlur={() => saveWeights(weights)}
                                className="w-20 px-2 py-1 text-xs text-center border border-violet-200 rounded outline-none focus:border-violet-400 bg-violet-50/50 text-violet-700"
                            />
                            <span className="text-[10px] text-slate-400">Время на подготовку при смене типа изделия в цехе (единое для всех цехов)</span>
                        </div>
                    </div>
                </div>

                {/* Dept Load Equalizer */}
                <DeptLoadEqualizer departments={normDepartments} />
            </div>

            {/* Input + Voice */}
            <div className="flex gap-2 items-center">
                <div className={twMerge(
                    "flex-1 flex items-center border rounded-lg px-4 py-3 gap-2",
                    listening ? "border-red-400 bg-red-50" : "border-slate-300 focus-within:border-blue-400"
                )}>
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handlePrompt()}
                        disabled={generating}
                        placeholder="Например: заказ для Рыжий очень важен, поднять приоритет..."
                        className="flex-1 text-sm outline-none bg-transparent disabled:opacity-50"
                    />
                    <button
                        onClick={toggleVoice}
                        disabled={generating}
                        className={twMerge(
                            "shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                            listening
                                ? "bg-red-500 text-white animate-pulse"
                                : "bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                        )}
                        title={listening ? "Остановить запись" : "Голосовой ввод"}
                    >
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                        </svg>
                    </button>
                </div>
                <Btn
                    onClick={handlePrompt}
                    disabled={generating || !prompt.trim()}
                    className="border border-slate-300 rounded-lg px-4 py-3 text-sm disabled:opacity-50"
                >
                    {generating ? "..." : "Отправить"}
                </Btn>
            </div>

            {/* Этапы обработки промпт-запроса — "сосиски" как у генерации */}
            {(promptPhase || promptCompletedPhases.size > 0 || promptFailed) && (
                <div className="border border-violet-200 bg-violet-50/50 rounded-lg p-3">
                    <div className="flex items-center gap-0">
                        {PROMPT_PHASES.map((phase, idx) => {
                            const isCompleted = promptCompletedPhases.has(phase.key);
                            const isCurrent = promptPhase === phase.key && !promptFailed;
                            const isFailed = promptFailed === phase.key;
                            const isPending = !isCompleted && !isCurrent && !isFailed;

                            return (
                                <div key={phase.key} className="flex items-center flex-1 min-w-0">
                                    <div
                                        className={twMerge(
                                            "flex-1 h-8 rounded-full flex items-center justify-center px-2 transition-all duration-500 relative overflow-hidden",
                                            isCompleted && "bg-green-500 text-white",
                                            isCurrent && "bg-violet-500 text-white",
                                            isFailed && "bg-red-500 text-white",
                                            isPending && "bg-slate-100 text-slate-400",
                                        )}
                                    >
                                        {isCurrent && (
                                            <div className="absolute inset-0 bg-violet-400 rounded-full animate-pulse opacity-30" />
                                        )}
                                        <div className="flex items-center gap-1.5 z-10 whitespace-nowrap">
                                            {isCompleted && <span className="text-xs">&#10003;</span>}
                                            {isCurrent && <span className="text-xs animate-spin">&#9696;</span>}
                                            {isFailed && <span className="text-xs">&#10007;</span>}
                                            {isPending && <span className="text-xs text-slate-300">&#9679;</span>}
                                            <span className="text-[11px] font-medium truncate">{phase.label}</span>
                                        </div>
                                    </div>
                                    {idx < PROMPT_PHASES.length - 1 && (
                                        <div className={twMerge(
                                            "w-2 h-1 shrink-0",
                                            isCompleted ? "bg-green-400" : "bg-slate-200"
                                        )} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

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

            {/* Orders Table — sticky left/right columns + sticky header, scrollable */}
            <div className="border border-slate-200 rounded-lg text-xs overflow-auto max-h-[80vh]">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                            <th className="sticky left-0 top-0 z-20 bg-slate-50 px-1 py-2 text-center min-w-[30px] w-[30px]">#</th>
                            <th className="sticky top-0 z-20 bg-slate-50 px-1 py-2 text-left min-w-[45px] w-[45px]" style={{left: 30}}>Фото</th>
                            <th className="sticky top-0 z-20 bg-slate-50 px-1 py-2 text-left min-w-[200px] w-[200px]" style={{left: 75}}>Изделие</th>
                            <th className="sticky top-0 z-20 bg-slate-50 px-1 py-2 text-left min-w-[65px] w-[65px]" style={{left: 275}}>Заказ</th>
                            <th className="sticky top-0 z-20 bg-slate-50 px-1 py-2 text-center min-w-[35px] w-[35px]" style={{left: 340}}>Кол</th>
                            <th className="sticky top-0 z-20 bg-slate-50 px-1 py-2 text-center min-w-[60px] w-[60px]" style={{left: 375}}>Срок</th>
                            <th className="sticky top-0 z-20 bg-slate-50 px-1 py-2 text-center min-w-[85px] w-[85px]" style={{left: 435}}>Ткань</th>
                            <th className="sticky top-0 z-20 bg-slate-50 px-1 py-2 text-center min-w-[35px] w-[35px] border-r border-slate-200" style={{left: 520}}>Вес</th>
                            {allDepartments.filter(d => visibleDepts.has(d)).map(dept => (
                                <th key={dept} className="sticky top-0 z-10 bg-slate-50 px-2 py-2 text-center whitespace-nowrap font-semibold border-l border-slate-200" style={{minWidth: 70}}>
                                    {dept}
                                </th>
                            ))}
                            <th className="sticky right-[120px] top-0 z-20 bg-slate-50 px-2 py-2 text-left border-l border-slate-200" style={{minWidth: 100}}>Обр. связь</th>
                            <th className="sticky right-0 top-0 z-20 bg-slate-50 px-2 py-2 text-left border-l border-slate-200" style={{minWidth: 120}}>AI комментарий</th>
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
                                onCommentAdded={() => queryClient.invalidateQueries({queryKey: ["planTable"]})}
                                norms={productNorms[item.product_id] || {}}
                                onNormChange={saveProductNorm}
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

function OrderRow({item, index, aiEntry, onFeedbackSave, visibleDepts, allDepartments, onOpenNorms, onCommentAdded, norms, onNormChange}: {
    item: IPlanDataRow;
    index: number;
    aiEntry?: IAiEntry;
    onFeedbackSave: (seriesId: string, feedback: string) => void;
    visibleDepts: Set<string>;
    allDepartments: string[];
    onOpenNorms: (productId: number, productName: string) => void;
    onCommentAdded: () => void;
    norms: Record<string, number>;
    onNormChange: (productId: number, dept: string, value: number) => void;
}) {
    const [feedback, setFeedback] = useState(aiEntry?.feedback ?? "");
    const [localNorms, setLocalNorms] = useState<Record<string, number>>(norms);
    // Синхронизируем при обновлении пропса (новая загрузка данных)
    useEffect(() => { setLocalNorms(norms); }, [norms]);
    const empty = {all: 0, ready: 0, await: 0};

    // Инпуты комментариев: какой тип сейчас открыт (null = все закрыты)
    const [commentInput, setCommentInput] = useState<'product' | 'order' | 'agent' | null>(null);
    const [commentText, setCommentText] = useState("");

    const submitComment = useCallback(() => {
        if (!commentText.trim() || !commentInput) return;
        const targetId = commentInput === 'product' ? item.order_product_id
            : commentInput === 'order' ? item.order_id
            : item.agent_id;
        if (!targetId) return;
        $axios.post('/plan/comments/add/', {
            type: commentInput, target_id: targetId, text: commentText.trim()
        }).then(() => {
            setCommentText("");
            setCommentInput(null);
            onCommentAdded();
            toast.success('Комментарий добавлен');
        }).catch(() => toast.error('Ошибка'));
    }, [commentInput, commentText, item, onCommentAdded]);

    const rowBg = item.urgency === 1 ? "bg-red-50" : item.urgency === 2 ? "bg-yellow-50" : "bg-white";

    return (
        <tr className="border-t border-slate-100">
            {/* # */}
            <td className={twMerge("sticky left-0 z-10 px-1 py-1.5 text-slate-400 font-medium text-center min-w-[30px] w-[30px]", rowBg)}>
                {index}
            </td>
            {/* Фото */}
            <td className={twMerge("sticky z-10 px-1 py-1.5 min-w-[45px] w-[45px]", rowBg)} style={{left: 30}}>
                <div className="w-[36px] h-[36px] bg-slate-100 rounded overflow-hidden flex items-center justify-center">
                    {item.product_picture ? (
                        <img src={STATIC_URL + item.product_picture} alt="" className="w-full h-full object-cover"/>
                    ) : (
                        <span className="text-[8px] text-slate-300">---</span>
                    )}
                </div>
            </td>
            {/* Изделие */}
            <td className={twMerge("sticky z-10 px-1 py-1.5 min-w-[300px] w-[300px] max-w-[300px]", rowBg)} style={{left: 75}}>
                <div className="overflow-x-auto">
                    {/* Название изделия — клик открывает инпут комментария к позиции */}
                    <div className="flex items-center gap-1 whitespace-nowrap">
                        {/* Кнопка копирования строки в буфер обмена */}
                        <button
                            className="shrink-0 w-4 h-4 flex items-center justify-center text-slate-300 hover:text-blue-500 transition-colors"
                            title="Копировать строку"
                            onClick={() => {
                                const parts = [item.product_name];
                                if (item.fabric_name) parts.push(item.fabric_name);
                                if (item.project) parts.push(item.project);
                                if (item.comments?.length) parts.push(...item.comments.map(c => c.text));
                                if (item.order_comments?.length) parts.push(...item.order_comments.map(c => c.text));
                                if (item.agent_comments?.length) parts.push(...item.agent_comments.map(c => c.text));
                                navigator.clipboard.writeText(parts.join('\n'));
                                toast.success('Скопировано');
                            }}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                                <rect x="9" y="9" width="13" height="13" rx="2" />
                                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                            </svg>
                        </button>
                        <span
                            className="font-medium text-slate-800 leading-tight cursor-pointer hover:text-blue-600"
                            onClick={() => setCommentInput(commentInput === 'product' ? null : 'product')}
                            title="Добавить комментарий к изделию"
                        >
                            {item.product_name}
                        </span>
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
                    {/* Комментарии к позиции (OrderProductComment) */}
                    {item.comments?.length > 0 && (
                        <div className="mt-0.5">
                            {item.comments.map(c => (
                                <div key={c.id} className="text-[9px] text-green-700 leading-tight">◉ {c.text}</div>
                            ))}
                        </div>
                    )}
                    {/* Комментарии к заказу (OrderComment) */}
                    {item.order_comments?.length > 0 && (
                        <div className="mt-0.5">
                            {item.order_comments.map(c => (
                                <div key={c.id} className="text-[9px] text-blue-600 leading-tight">▪ {c.text}</div>
                            ))}
                        </div>
                    )}
                    {/* Комментарии к заказчику (AgentComment) */}
                    {item.agent_comments?.length > 0 && (
                        <div className="mt-0.5">
                            {item.agent_comments.map(c => (
                                <div key={c.id} className="text-[9px] text-purple-600 leading-tight">★ {c.text}</div>
                            ))}
                        </div>
                    )}
                    {/* Инпут для добавления комментария */}
                    {commentInput && (
                        <div className="mt-1 flex gap-1">
                            <input
                                autoFocus
                                value={commentText}
                                onChange={e => setCommentText(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && submitComment()}
                                placeholder={
                                    commentInput === 'product' ? 'Комментарий к изделию...' :
                                    commentInput === 'order' ? 'Комментарий к заказу...' :
                                    'Комментарий к заказчику...'
                                }
                                className={twMerge(
                                    "flex-1 text-[10px] px-1.5 py-0.5 border rounded outline-none",
                                    commentInput === 'product' ? "border-green-300 focus:border-green-500" :
                                    commentInput === 'order' ? "border-blue-300 focus:border-blue-500" :
                                    "border-purple-300 focus:border-purple-500"
                                )}
                            />
                            <button onClick={submitComment} className="text-[9px] px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200">↵</button>
                            <button onClick={() => { setCommentInput(null); setCommentText(""); }} className="text-[9px] px-1 py-0.5 text-slate-400 hover:text-red-500">✕</button>
                        </div>
                    )}
                </div>
            </td>
            {/* Заказ — клик открывает инпут комментария к заказу */}
            <td className={twMerge("sticky z-10 px-1 py-1.5 w-[65px] min-w-[65px] max-w-[65px]", rowBg)} style={{left: 275}}>
                <span
                    className={twMerge(
                        "text-xs truncate block cursor-pointer hover:text-blue-600",
                        item.urgency === 1 && "bg-red-200 px-1 rounded font-semibold text-red-800"
                    )}
                    onClick={() => setCommentInput(commentInput === 'order' ? null : 'order')}
                    title="Добавить комментарий к заказу"
                >
                    {item.order}
                </span>
                {/* Заказчик — клик открывает инпут комментария к заказчику */}
                {item.agent_name && (
                    <span
                        className="text-[9px] text-purple-500 truncate block cursor-pointer hover:text-purple-700"
                        onClick={() => item.agent_id && setCommentInput(commentInput === 'agent' ? null : 'agent')}
                        title="Добавить комментарий к заказчику"
                    >
                        {item.agent_name}
                    </span>
                )}
            </td>
            {/* Кол */}
            <td className={twMerge("sticky z-10 px-1 py-1.5 text-center font-semibold min-w-[35px] w-[35px]", rowBg)} style={{left: 340}}>
                {item.quantity}
            </td>
            {/* Срок */}
            <td className={twMerge("sticky z-10 px-1 py-1.5 text-center min-w-[60px] w-[60px]", rowBg)} style={{left: 375}}>
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
            {/* Ткань — дата получения */}
            <td className={twMerge("sticky z-10 px-1 py-1.5 text-center min-w-[85px] w-[85px]", rowBg)} style={{left: 435}}>
                <input
                    type="date"
                    value={item.fabric_available_date ?? ''}
                    onChange={e => {
                        const val = e.target.value || null;
                        $axios.post('/plan/fabric_date/', {
                            order_product_id: item.order_product_id,
                            date: val,
                        }).then(() => toast.success('Дата ткани сохранена'))
                          .catch(() => toast.error('Ошибка сохранения'));
                    }}
                    className={twMerge(
                        "w-full text-[10px] px-0.5 py-0.5 outline-none border rounded bg-transparent text-center",
                        item.fabric_available_date
                            ? "border-orange-300 text-orange-600 bg-orange-50"
                            : "border-transparent text-slate-300"
                    )}
                    title={item.fabric_available_date ? `Ткань ожидается: ${item.fabric_available_date}` : 'Ткань в наличии (нажмите чтобы указать дату)'}
                />
            </td>
            {/* Вес */}
            <td
                className={twMerge("sticky z-10 px-1 py-1.5 text-center min-w-[35px] w-[35px] border-r border-slate-200 cursor-help", rowBg)}
                style={{left: 520}}
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

            {/* Department cells — assignment counts + inline norm input */}
            {allDepartments.filter(d => visibleDepts.has(d)).map(dept => {
                const d = item.assignments[dept] || empty;
                const normVal = localNorms[dept] ?? 0;
                if (d.all === 0) return (
                    <td key={dept} className={twMerge("px-1 py-1 text-center border-l border-slate-200", rowBg)} style={{minWidth: 70}}>
                        <div className="text-slate-200">—</div>
                        <input
                            type="number"
                            step="0.05"
                            min="0"
                            value={normVal || ''}
                            onChange={e => {
                                const v = e.target.value === '' ? 0 : parseFloat(e.target.value) || 0;
                                setLocalNorms(prev => ({...prev, [dept]: v}));
                                onNormChange(item.product_id, dept, v);
                            }}
                            className="w-full text-[9px] text-center text-slate-400 bg-transparent outline-none mt-0.5"
                            placeholder="—"
                        />
                    </td>
                );
                const done = d.ready === d.all;
                return (
                    <td key={dept} className={twMerge("px-1 py-1 text-center border-l border-slate-200", rowBg)} style={{minWidth: 70}}>
                        <span className={twMerge(
                            "text-[11px] font-medium",
                            done ? "text-green-600" : d.ready > 0 ? "text-yellow-600" : "text-slate-500"
                        )}>
                            {d.ready}/{d.all}
                        </span>
                        <input
                            type="number"
                            step="0.05"
                            min="0"
                            value={normVal || ''}
                            onChange={e => {
                                const v = e.target.value === '' ? 0 : parseFloat(e.target.value) || 0;
                                setLocalNorms(prev => ({...prev, [dept]: v}));
                                onNormChange(item.product_id, dept, v);
                            }}
                            className="w-full text-[9px] text-center text-slate-400 bg-transparent outline-none mt-0.5"
                            placeholder="—"
                        />
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
