import {useState, useCallback, useRef, useEffect} from "react";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {$axios} from "@/shared/api";
import {toast} from "sonner";

interface INormRow {
    id?: number;
    name: string;
    batch?: Record<string, number>;
    setup?: Record<string, number>;
    [dept: string]: string | number | Record<string, number> | undefined;
}

interface INormsData {
    departments: string[];
    rows: INormRow[];
}

export function NormsTable() {
    const queryClient = useQueryClient();
    const {data} = useQuery<INormsData>({
        queryKey: ["productionNorms"],
        queryFn: () => $axios.get<INormsData>('/plan/norms/').then(r => r.data),
    });

    const [rows, setRows] = useState<INormRow[]>([]);
    const [schemas, setSchemas] = useState<Record<number, number>>({});
    const [newTypeName, setNewTypeName] = useState("");
    const [collapsed, setCollapsed] = useState(true);
    const [showBatch, setShowBatch] = useState(false);
    const [showSetup, setShowSetup] = useState(false);
    const [classifying, setClassifying] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (data?.rows) {
            setRows(data.rows);
            // Загрузить схемы для всех типов
            for (const row of data.rows) {
                if (row.id) {
                    $axios.get(`/plan/workflow/${row.id}/`).then(res => {
                        setSchemas(prev => ({...prev, [row.id!]: res.data.schema || 0}));
                    }).catch(() => {});
                }
            }
        }
    }, [data]);

    const departments = data?.departments || [];

    const saveRows = useCallback((updatedRows: INormRow[]) => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            $axios.post('/plan/norms/update/', {rows: updatedRows}).then(
                () => toast.success('Нормативы сохранены'),
                () => toast.error('Ошибка сохранения')
            );
        }, 1000);
    }, []);

    const handleCellChange = useCallback((rowIdx: number, field: string, value: string) => {
        setRows(prev => {
            const updated = [...prev];
            updated[rowIdx] = {
                ...updated[rowIdx],
                [field]: field === 'name' ? value : (value === '' ? 0 : parseFloat(value) || 0),
            };
            saveRows(updated);
            return updated;
        });
    }, [saveRows]);

    // Изменение коэффициента настила для конкретного цеха
    const handleBatchChange = useCallback((rowIdx: number, dept: string, value: string) => {
        setRows(prev => {
            const updated = [...prev];
            const batch = {...(updated[rowIdx].batch || {})};
            batch[dept] = value === '' ? 0 : Math.max(0, Math.min(0.5, parseFloat(value) || 0));
            updated[rowIdx] = {...updated[rowIdx], batch};
            saveRows(updated);
            return updated;
        });
    }, [saveRows]);

    // Изменение времени переключения для конкретного цеха (в минутах)
    const handleSetupChange = useCallback((rowIdx: number, dept: string, value: string) => {
        setRows(prev => {
            const updated = [...prev];
            const setup = {...(updated[rowIdx].setup || {})};
            setup[dept] = value === '' ? 0 : Math.max(0, Math.min(120, parseFloat(value) || 0));
            updated[rowIdx] = {...updated[rowIdx], setup};
            saveRows(updated);
            return updated;
        });
    }, [saveRows]);

    const handleAddType = useCallback(() => {
        const name = newTypeName.trim();
        if (!name) return;
        $axios.post('/plan/norms/add_type/', {name}).then(
            (res) => {
                queryClient.invalidateQueries({queryKey: ["productionNorms"]});
                setNewTypeName("");
                toast.success(`Тип "${res.data.name}" добавлен`);
            },
            (err) => toast.error(err.response?.data?.error || 'Ошибка')
        );
    }, [newTypeName, queryClient]);

    const handleDeleteType = useCallback((id: number | undefined, name: string) => {
        if (!id || !confirm(`Удалить тип "${name}"?`)) return;
        $axios.post('/plan/norms/delete_type/', {id}).then(
            () => {
                queryClient.invalidateQueries({queryKey: ["productionNorms"]});
                toast.success('Удалено');
            },
            () => toast.error('Ошибка удаления')
        );
    }, [queryClient]);

    const handleSchemaChange = useCallback((id: number | undefined, schema: number) => {
        if (!id) return;
        $axios.post(`/plan/workflow/${id}/update/`, {schema}).then(
            () => toast.success('Схема сохранена'),
            () => toast.error('Ошибка сохранения схемы')
        );
    }, []);

    const handleClassify = useCallback(() => {
        setClassifying(true);
        const runBatch = (offset: number) => {
            $axios.post('/plan/products/classify/', {offset}).then(
                (res) => {
                    const d = res.data;
                    toast.success(d.response || `Обновлено: ${d.updated}, пропущено: ${d.skipped}`);
                    if (d.remaining > 0 && d.updated > 0) {
                        runBatch(offset + 50);
                    } else {
                        setClassifying(false);
                        toast.success(`Классификация завершена! Осталось без типа: ${d.remaining || 0} (комплектующие)`);
                    }
                },
                (err) => {
                    toast.error(err.response?.data?.error || 'Ошибка классификации');
                    setClassifying(false);
                }
            );
        };
        runBatch(0);
    }, []);

    return (
        <div className="border border-slate-200 rounded-lg overflow-hidden">
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="w-full px-4 py-2 bg-slate-50 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100 flex justify-between items-center"
            >
                <span>Таблица нормативов (часов на 1 изделие)</span>
                <span className="text-slate-400">{collapsed ? "▸" : "▾"}</span>
            </button>

            {!collapsed && (
                <div className="p-3">
                    {/* Переключатель отображения настила */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <button
                            onClick={() => setShowBatch(!showBatch)}
                            className={`text-[10px] px-2 py-1 rounded border ${showBatch ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                        >
                            {showBatch ? 'Скрыть настил' : 'Показать настил'}
                        </button>
                        <button
                            onClick={() => setShowSetup(!showSetup)}
                            className={`text-[10px] px-2 py-1 rounded border ${showSetup ? 'bg-violet-50 border-violet-300 text-violet-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                        >
                            {showSetup ? 'Скрыть переключение' : 'Показать переключение'}
                        </button>
                        {showBatch && <span className="text-[10px] text-slate-400">Настил: коэффициент ускорения при серии одинаковых изделий (0 — 0.5)</span>}
                        {showSetup && <span className="text-[10px] text-slate-400">Переключение: минуты на подготовку при смене типа изделия (0 — 120)</span>}
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs border-collapse">
                            <thead>
                                <tr className="bg-blue-600 text-white">
                                    <th className="px-3 py-2 text-left font-semibold min-w-[140px]">Тип изделия</th>
                                    {departments.map(d => (
                                        <th key={d} className="px-2 py-2 text-center font-semibold min-w-[70px]">{d}</th>
                                    ))}
                                    <th className="px-2 py-2 text-center font-semibold min-w-[120px]">Схема</th>
                                    <th className="px-2 py-2 w-8"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row, rowIdx) => {
                                    const extraRows = (showBatch ? 1 : 0) + (showSetup ? 1 : 0);
                                    const span = 1 + extraRows;
                                    return (<>
                                    <tr key={row.id || rowIdx} className="border-b border-slate-100 hover:bg-slate-50">
                                        <td className="px-1 py-1" rowSpan={span}>
                                            <input
                                                value={row.name}
                                                onChange={e => handleCellChange(rowIdx, 'name', e.target.value)}
                                                className="w-full px-2 py-1 text-xs outline-none border border-transparent focus:border-blue-300 rounded bg-transparent"
                                            />
                                        </td>
                                        {departments.map(dept => (
                                            <td key={dept} className="px-1 py-1">
                                                <input
                                                    type="number"
                                                    step="0.05"
                                                    min="0"
                                                    value={(row[dept] as number) ?? 0}
                                                    onChange={e => handleCellChange(rowIdx, dept, e.target.value)}
                                                    className="w-full px-2 py-1 text-xs text-center outline-none border border-transparent focus:border-blue-300 rounded bg-transparent"
                                                />
                                            </td>
                                        ))}
                                        <td className="px-1 py-1 text-center" rowSpan={span}>
                                            <select
                                                value={schemas[row.id!] || 0}
                                                onChange={e => {
                                                    const val = parseInt(e.target.value);
                                                    setSchemas(prev => ({...prev, [row.id!]: val}));
                                                    if (val > 0) handleSchemaChange(row.id, val);
                                                }}
                                                className="text-[10px] border border-slate-200 rounded px-1 py-0.5 bg-white outline-none"
                                            >
                                                <option value={0}>—</option>
                                                <option value={1}>Полный цикл</option>
                                                <option value={2}>Без столярки/малярки</option>
                                            </select>
                                        </td>
                                        <td className="px-1 py-1 text-center" rowSpan={span}>
                                            <button
                                                onClick={() => handleDeleteType(row.id, row.name)}
                                                className="text-slate-300 hover:text-red-500 text-sm"
                                                title="Удалить"
                                            >
                                                x
                                            </button>
                                        </td>
                                    </tr>
                                    {/* Строка настила — коэффициенты batch_bonus по цехам */}
                                    {showBatch && (
                                        <tr key={`batch-${row.id || rowIdx}`} className="border-b border-slate-200 bg-amber-50/50">
                                            {departments.map(dept => {
                                                const batchVal = row.batch?.[dept] ?? 0;
                                                return (
                                                    <td key={dept} className="px-1 py-0.5">
                                                        <input
                                                            type="number"
                                                            step="0.05"
                                                            min="0"
                                                            max="0.5"
                                                            value={batchVal}
                                                            onChange={e => handleBatchChange(rowIdx, dept, e.target.value)}
                                                            className="w-full px-2 py-0.5 text-[10px] text-center outline-none border border-transparent focus:border-amber-400 rounded bg-transparent text-amber-700"
                                                            title={`Настил: ${Math.round(batchVal * 100)}% ускорение при серии`}
                                                        />
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    )}
                                    {/* Строка переключения — минуты setup при смене типа изделия */}
                                    {showSetup && (
                                        <tr key={`setup-${row.id || rowIdx}`} className="border-b border-slate-200 bg-violet-50/50">
                                            {departments.map(dept => {
                                                const setupVal = row.setup?.[dept] ?? 0;
                                                return (
                                                    <td key={dept} className="px-1 py-0.5">
                                                        <input
                                                            type="number"
                                                            step="1"
                                                            min="0"
                                                            max="120"
                                                            value={setupVal}
                                                            onChange={e => handleSetupChange(rowIdx, dept, e.target.value)}
                                                            className="w-full px-2 py-0.5 text-[10px] text-center outline-none border border-transparent focus:border-violet-400 rounded bg-transparent text-violet-700"
                                                            title={`Переключение: ${setupVal} мин при смене на ${row.name}`}
                                                        />
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    )}
                                </>);})}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex gap-2 mt-3">
                        <input
                            type="text"
                            value={newTypeName}
                            onChange={e => setNewTypeName(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAddType()}
                            placeholder="Новый тип изделия..."
                            className="flex-1 border border-slate-300 rounded px-3 py-1.5 text-xs outline-none focus:border-blue-400"
                        />
                        <button
                            onClick={handleAddType}
                            disabled={!newTypeName.trim()}
                            className="border border-slate-300 rounded px-3 py-1.5 text-xs hover:bg-slate-50 disabled:opacity-30"
                        >
                            Добавить
                        </button>
                        <button
                            onClick={handleClassify}
                            disabled={classifying}
                            className="border border-green-400 bg-green-50 text-green-700 rounded px-3 py-1.5 text-xs hover:bg-green-100 disabled:opacity-50 disabled:cursor-wait"
                        >
                            {classifying ? "Классификация..." : "Классифицировать продукты"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
