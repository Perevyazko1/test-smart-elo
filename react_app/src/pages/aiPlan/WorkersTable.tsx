import {useState, useCallback, useRef, useEffect} from "react";
import {useQuery} from "@tanstack/react-query";
import {$axios} from "@/shared/api";
import {toast} from "sonner";

interface IWorkerRow {
    department: string;
    workers_count: number;
}

export function WorkersTable() {
    const {data} = useQuery<{rows: IWorkerRow[]}>({
        queryKey: ["departmentWorkers"],
        queryFn: () => $axios.get('/plan/workers/').then(r => r.data),
    });

    const [rows, setRows] = useState<IWorkerRow[]>([]);
    const [collapsed, setCollapsed] = useState(true);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (data?.rows) setRows(data.rows);
    }, [data]);

    const saveRows = useCallback((updatedRows: IWorkerRow[]) => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            $axios.post('/plan/workers/update/', {rows: updatedRows}).then(
                () => toast.success('Рабочие сохранены'),
                () => toast.error('Ошибка сохранения')
            );
        }, 1000);
    }, []);

    const handleChange = useCallback((idx: number, value: string) => {
        setRows(prev => {
            const updated = [...prev];
            updated[idx] = {...updated[idx], workers_count: parseInt(value) || 0};
            saveRows(updated);
            return updated;
        });
    }, [saveRows]);

    return (
        <div className="border border-slate-200 rounded-lg overflow-hidden">
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="w-full px-4 py-2 bg-slate-50 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100 flex justify-between items-center"
            >
                <span>Количество рабочих по цехам</span>
                <span className="text-slate-400">{collapsed ? "▼" : "▲"}</span>
            </button>

            {!collapsed && (
                <div className="p-3">
                    <div className="grid grid-cols-4 gap-2">
                        {rows.map((row, idx) => (
                            <div key={row.department} className="flex items-center gap-2 border border-slate-100 rounded px-3 py-2">
                                <span className="text-xs text-slate-600 flex-1">{row.department}</span>
                                <input
                                    type="number"
                                    min="0"
                                    value={row.workers_count}
                                    onChange={e => handleChange(idx, e.target.value)}
                                    className="w-16 px-2 py-1 text-xs text-center outline-none border border-transparent focus:border-blue-300 rounded bg-transparent"
                                />
                                <span className="text-[10px] text-slate-400">чел.</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
