import {useState, useEffect, useCallback} from "react";
import {$axios} from "@/shared/api";
import {toast} from "sonner";
import {twMerge} from "tailwind-merge";
import {Btn} from "@/shared/ui/buttons/Btn.tsx";

interface NormRow {
    department: string;
    default: number;
    override: number | null;
}

interface ProductNormsData {
    product_id: number;
    product_name: string;
    product_type: string | null;
    rows: NormRow[];
}

interface Props {
    productId: number | null;
    productName: string;
    isOpen: boolean;
    onClose: () => void;
}

export const ProductNormsModal = ({productId, productName, isOpen, onClose}: Props) => {
    const [data, setData] = useState<ProductNormsData | null>(null);
    const [edits, setEdits] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!isOpen || !productId) return;
        setEdits({});
        $axios.get<ProductNormsData>(`/plan/product_norms/${productId}/`).then(r => {
            setData(r.data);
            const initial: Record<string, string> = {};
            for (const row of r.data.rows) {
                initial[row.department] = row.override !== null ? String(row.override) : "";
            }
            setEdits(initial);
        });
    }, [isOpen, productId]);

    const handleSave = useCallback(() => {
        if (!productId || !data) return;
        setSaving(true);
        const overrides: Record<string, number | null> = {};
        for (const row of data.rows) {
            const val = edits[row.department]?.trim();
            if (val === "" || val === undefined) {
                // Удалить override если был
                if (row.override !== null) overrides[row.department] = null;
            } else {
                const num = parseFloat(val);
                if (!isNaN(num)) overrides[row.department] = num;
            }
        }
        $axios.post(`/plan/product_norms/${productId}/update/`, {overrides}).then(() => {
            toast.success("Нормативы сохранены");
            onClose();
        }).catch(() => {
            toast.error("Ошибка сохранения");
        }).finally(() => setSaving(false));
    }, [productId, data, edits, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
            <div
                className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 border-b border-slate-200">
                    <div className="font-semibold text-sm text-slate-800">{productName}</div>
                    <div className="text-xs text-slate-400">
                        Тип: {data?.product_type || "не задан"} | Нормативы изделия
                    </div>
                </div>

                <div className="p-4">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-xs text-slate-500 border-b border-slate-100">
                                <th className="text-left py-1.5 font-medium">Цех</th>
                                <th className="text-center py-1.5 font-medium w-[80px]">Дефолт</th>
                                <th className="text-center py-1.5 font-medium w-[100px]">Override</th>
                                <th className="w-[30px]"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.rows.map(row => {
                                const hasOverride = edits[row.department]?.trim() !== "";
                                return (
                                    <tr key={row.department} className="border-b border-slate-50">
                                        <td className="py-1.5 text-slate-700">{row.department}</td>
                                        <td className="py-1.5 text-center text-slate-400">
                                            {row.default > 0 ? `${row.default}ч` : "—"}
                                        </td>
                                        <td className="py-1.5 text-center">
                                            <input
                                                type="number"
                                                step="0.1"
                                                min="0"
                                                value={edits[row.department] ?? ""}
                                                onChange={e => setEdits(prev => ({
                                                    ...prev,
                                                    [row.department]: e.target.value,
                                                }))}
                                                placeholder={row.default > 0 ? String(row.default) : "—"}
                                                className={twMerge(
                                                    "w-[70px] text-center border rounded px-1.5 py-0.5 text-sm outline-none",
                                                    hasOverride
                                                        ? "border-blue-300 bg-blue-50 text-blue-800"
                                                        : "border-slate-200 text-slate-400"
                                                )}
                                            />
                                        </td>
                                        <td className="py-1.5 text-center">
                                            {hasOverride && (
                                                <button
                                                    onClick={() => setEdits(prev => ({
                                                        ...prev,
                                                        [row.department]: "",
                                                    }))}
                                                    className="text-slate-300 hover:text-red-400 text-xs"
                                                    title="Сбросить к дефолту"
                                                >
                                                    x
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-slate-200 flex gap-2 justify-end">
                    <Btn
                        onClick={onClose}
                        className="border border-slate-200 rounded-lg px-4 py-1.5 text-sm text-slate-600"
                    >
                        Отмена
                    </Btn>
                    <Btn
                        onClick={handleSave}
                        disabled={saving}
                        className="border border-blue-400 bg-blue-100 text-blue-800 rounded-lg px-4 py-1.5 text-sm font-medium"
                    >
                        {saving ? "..." : "Сохранить"}
                    </Btn>
                </div>
            </div>
        </div>
    );
};
