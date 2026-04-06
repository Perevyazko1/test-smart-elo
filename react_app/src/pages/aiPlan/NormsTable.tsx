import {useState, useCallback, useRef, useEffect} from "react";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {$axios} from "@/shared/api";
import {toast} from "sonner";

interface INormRow {
    id?: number;
    name: string;
    [dept: string]: string | number | undefined;
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
    const [newTypeName, setNewTypeName] = useState("");
    const [collapsed, setCollapsed] = useState(true);
    const [classifying, setClassifying] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (data?.rows) setRows(data.rows);
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

    const handleClassify = useCallback(() => {
        setClassifying(true);
        const runBatch = (offset: number) => {
            $axios.post('/plan/products/classify/', {offset}).then(
                (res) => {
                    const d = res.data;
                    toast.success(d.response || `Обновлено: ${d.updated}, пропущено: ${d.skipped}`);
                    if (d.remaining > 0) {
                        runBatch(offset + 50);
                    } else {
                        setClassifying(false);
                        toast.success('Классификация завершена!');
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
                <span className="text-slate-400">{collapsed ? "▼" : "▲"}</span>
            </button>

            {!collapsed && (
                <div className="p-3">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs border-collapse">
                            <thead>
                                <tr className="bg-blue-600 text-white">
                                    <th className="px-3 py-2 text-left font-semibold min-w-[140px]">Тип изделия</th>
                                    {departments.map(d => (
                                        <th key={d} className="px-2 py-2 text-center font-semibold min-w-[70px]">{d}</th>
                                    ))}
                                    <th className="px-2 py-2 w-8"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row, rowIdx) => (
                                    <tr key={row.id || rowIdx} className="border-b border-slate-100 hover:bg-slate-50">
                                        <td className="px-1 py-1">
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
                                                    value={row[dept] ?? 0}
                                                    onChange={e => handleCellChange(rowIdx, dept, e.target.value)}
                                                    className="w-full px-2 py-1 text-xs text-center outline-none border border-transparent focus:border-blue-300 rounded bg-transparent"
                                                />
                                            </td>
                                        ))}
                                        <td className="px-1 py-1 text-center">
                                            <button
                                                onClick={() => handleDeleteType(row.id, row.name)}
                                                className="text-slate-300 hover:text-red-500 text-sm"
                                                title="Удалить"
                                            >
                                                x
                                            </button>
                                        </td>
                                    </tr>
                                ))}
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
