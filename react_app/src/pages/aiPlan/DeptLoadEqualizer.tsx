import {useState} from "react";

interface Props {
    departments: string[];
}

const SHORT_NAMES: Record<string, string> = {
    "Конструктора": "Констр",
    "Малярка": "Маляр",
    "Обивка": "Обив",
    "Сборка": "Сбор",
    "Пошив": "Пошив",
};

export function DeptLoadEqualizer({departments}: Props) {
    const [values, setValues] = useState<Record<string, number>>(() => {
        const init: Record<string, number> = {};
        for (const d of departments) init[d] = 7;
        return init;
    });

    if (!departments.length) return null;

    return (
        <div className="border border-slate-200 rounded-lg p-3 bg-white min-w-0">
            <div className="text-xs font-semibold text-slate-700 mb-2">Загрузка цехов (дни)</div>
            <div className="flex gap-1 items-end" style={{height: 140}}>
                {departments.map(dept => {
                    const val = values[dept] ?? 7;
                    const pct = ((val - 1) / 13) * 100;
                    const color = val >= 11 ? "bg-red-400" : val >= 7 ? "bg-yellow-400" : "bg-green-400";
                    const short = SHORT_NAMES[dept] || dept.slice(0, 4);

                    return (
                        <div key={dept} className="flex flex-col items-center gap-1" style={{width: 32}}>
                            <span className="text-[10px] font-mono text-slate-500 leading-none">{val}</span>
                            <div
                                className="relative w-3 rounded-full bg-slate-100 cursor-pointer"
                                style={{height: 90}}
                                onClick={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const y = e.clientY - rect.top;
                                    const ratio = 1 - y / rect.height;
                                    const newVal = Math.round(ratio * 13 + 1);
                                    setValues(prev => ({...prev, [dept]: Math.max(1, Math.min(14, newVal))}));
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
                                {short}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
