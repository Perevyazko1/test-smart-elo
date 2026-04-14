import {useState, useCallback, useRef, useEffect} from "react";
import {useQuery} from "@tanstack/react-query";
import {$axios} from "@/shared/api";
import {toast} from "sonner";

/* Настил по цехам — одна строка с инпутами (0-0.5).
   Привязан только к цеху, не зависит от типа изделия. */

interface IBatchData {
    departments: string[];
    bonuses: Record<string, number>;
}

export function BatchBonusTable() {
    const {data} = useQuery<IBatchData>({
        queryKey: ["batchBonuses"],
        queryFn: () => $axios.get<IBatchData>('/plan/batch_bonuses/').then(r => r.data),
    });

    const [bonuses, setBonuses] = useState<Record<string, number>>({});
    const [collapsed, setCollapsed] = useState(true);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (data?.bonuses) setBonuses(data.bonuses);
    }, [data]);

    const departments = data?.departments || [];

    const saveBonuses = useCallback((updated: Record<string, number>) => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            $axios.post('/plan/batch_bonuses/update/', {bonuses: updated}).then(
                () => toast.success('Настил сохранён'),
                () => toast.error('Ошибка сохранения')
            );
        }, 1000);
    }, []);

    const handleChange = useCallback((dept: string, value: string) => {
        setBonuses(prev => {
            const updated = {...prev, [dept]: value === '' ? 0 : Math.max(0, Math.min(0.5, parseFloat(value) || 0))};
            saveBonuses(updated);
            return updated;
        });
    }, [saveBonuses]);

    return (
        <div className="border border-slate-200 rounded-lg overflow-hidden">
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="w-full px-4 py-2 bg-slate-50 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100 flex justify-between items-center"
            >
                <span>Настил по цехам (коэффициент ускорения при серии, 0 — 0.5)</span>
                <span className="text-slate-400">{collapsed ? "▸" : "▾"}</span>
            </button>

            {!collapsed && (
                <div className="p-3">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs border-collapse">
                            <thead>
                                <tr className="bg-amber-600 text-white">
                                    {departments.map(d => (
                                        <th key={d} className="px-2 py-2 text-center font-semibold min-w-[70px]">{d}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-slate-100 bg-amber-50/50">
                                    {departments.map(dept => (
                                        <td key={dept} className="px-1 py-1">
                                            <input
                                                type="number"
                                                step="0.05"
                                                min="0"
                                                max="0.5"
                                                value={bonuses[dept] ?? 0}
                                                onChange={e => handleChange(dept, e.target.value)}
                                                className="w-full px-2 py-1 text-xs text-center outline-none border border-transparent focus:border-amber-400 rounded bg-transparent text-amber-700"
                                                title={`Настил: ${Math.round((bonuses[dept] ?? 0) * 100)}% ускорение при серии`}
                                            />
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                        Коэффициент ускорения при серии одинаковых изделий подряд в цехе (0 — нет бонуса, 0.3 — на 30% быстрее)
                    </div>
                </div>
            )}
        </div>
    );
}
