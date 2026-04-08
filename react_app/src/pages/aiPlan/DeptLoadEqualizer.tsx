import {useState, useEffect, useRef, useCallback} from "react";
import {useQuery} from "@tanstack/react-query";
import {$axios} from "@/shared/api";

interface Props {
    departments: string[];
}

interface WorkerRow {
    department: string;
    workers_count: number;
    target_load_days: number;
}

export function DeptLoadEqualizer({departments}: Props) {
    const {data} = useQuery<{rows: WorkerRow[]}>({
        queryKey: ["departmentWorkers"],
        queryFn: () => $axios.get('/plan/workers/').then(r => r.data),
    });

    const [values, setValues] = useState<Record<string, number>>({});
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (data?.rows) {
            const init: Record<string, number> = {};
            for (const r of data.rows) init[r.department] = r.target_load_days ?? 7;
            setValues(init);
        }
    }, [data]);

    const saveLoads = useCallback((loads: Record<string, number>) => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            $axios.post('/plan/workers/load/', {loads});
        }, 800);
    }, []);

    if (!departments.length) return null;

    return (
        <div className="border border-slate-200 rounded-lg p-3 bg-white min-w-0">
            <div className="text-xs font-semibold text-slate-700 mb-2">Загрузка цехов (дни)</div>
            <div className="flex items-end justify-between gap-0.5" style={{height: 140}}>
                {departments.map(dept => {
                    const val = values[dept] ?? 7;
                    const pct = ((val - 1) / 13) * 100;
                    const color = val >= 11 ? "bg-red-400" : val >= 7 ? "bg-yellow-400" : "bg-green-400";

                    return (
                        <div key={dept} className="flex flex-col items-center gap-1 flex-1 min-w-0">
                            <span className="text-[10px] font-mono text-slate-500 leading-none">{val}</span>
                            <div
                                className="relative w-3 rounded-full bg-slate-100 cursor-pointer"
                                style={{height: 90}}
                                onClick={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const y = e.clientY - rect.top;
                                    const ratio = 1 - y / rect.height;
                                    const newVal = Math.max(1, Math.min(14, Math.round(ratio * 13 + 1)));
                                    const next = {...values, [dept]: newVal};
                                    setValues(next);
                                    saveLoads(next);
                                }}
                            >
                                <div
                                    className={`absolute bottom-0 left-0 right-0 rounded-full transition-all ${color}`}
                                    style={{height: `${pct}%`}}
                                />
                            </div>
                            <span
                                className="text-[9px] text-slate-500 leading-tight text-center truncate w-full"
                                title={dept}
                            >
                                {dept}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
