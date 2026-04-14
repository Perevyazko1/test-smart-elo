import {useState, useEffect, useCallback, useRef} from "react";
import {$axios} from "@/shared/api";
import {toast} from "sonner";
import {twMerge} from "tailwind-merge";
import {STATIC_URL} from "@/shared/consts/serverConfig.ts";

/* Модалка по клику на изделие в графике загрузки цехов.
   Показывает: инфу по заказу/заказчику, комментарии, нормативы с редактированием. */

interface ProductDetail {
    product_id: number;
    product_name: string;
    product_type: string | null;
    order_id: number;
    order_number: string;
    agent_id: number | null;
    agent_name: string | null;
    quantity: number;
    price: string;
    product_comments: {id: number; text: string; add_date: string}[];
    order_comments: {id: number; text: string; add_date: string}[];
    agent_comments: {id: number; text: string; add_date: string}[];
}

interface NormRow {
    department: string;
    default: number;
    override: number | null;
}

interface Props {
    productId: number | null;
    productName: string;
    picture: string | null;
    isOpen: boolean;
    onClose: () => void;
}

export const ChartProductModal = ({productId, productName, picture, isOpen, onClose}: Props) => {
    const [detail, setDetail] = useState<ProductDetail | null>(null);
    const [normRows, setNormRows] = useState<NormRow[]>([]);
    const [edits, setEdits] = useState<Record<string, string>>({});
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Загрузка данных при открытии модалки
    useEffect(() => {
        if (!isOpen || !productId) return;
        setDetail(null);
        setNormRows([]);
        setEdits({});

        // Загружаем детали изделия и нормативы параллельно
        Promise.all([
            $axios.get<ProductDetail>(`/plan/product_detail/${productId}/`).then(r => r.data),
            $axios.get<{rows: NormRow[]}>(`/plan/product_norms/${productId}/`).then(r => r.data),
        ]).then(([detailData, normsData]) => {
            setDetail(detailData);
            setNormRows(normsData.rows);
            const initial: Record<string, string> = {};
            for (const row of normsData.rows) {
                initial[row.department] = row.override !== null ? String(row.override) : "";
            }
            setEdits(initial);
        }).catch(() => toast.error('Ошибка загрузки данных'));
    }, [isOpen, productId]);

    // Сохранение норматива с debounce
    const saveNorm = useCallback((dept: string, value: string) => {
        if (!productId) return;
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            const overrides: Record<string, number | null> = {};
            if (value.trim() === "") {
                overrides[dept] = null;
            } else {
                const num = parseFloat(value);
                if (!isNaN(num)) overrides[dept] = num;
            }
            $axios.post(`/plan/product_norms/${productId}/update/`, {overrides}).then(
                () => toast.success('Норматив сохранён'),
                () => toast.error('Ошибка сохранения')
            );
        }, 1000);
    }, [productId]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
            <div
                className="bg-white rounded-xl shadow-xl w-full max-w-xl mx-4 max-h-[85vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                {/* Шапка: фото + основная инфо */}
                <div className="p-4 border-b border-slate-200 flex gap-4">
                    {/* Фото изделия */}
                    <div className="w-[80px] h-[80px] rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center shrink-0">
                        {picture ? (
                            <img src={STATIC_URL + picture} alt="" className="w-full h-full object-cover"/>
                        ) : (
                            <span className="text-xs text-slate-300">нет фото</span>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-slate-800 leading-tight">{productName}</div>
                        {detail ? (
                            <>
                                <div className="text-xs text-slate-400 mt-0.5">
                                    Тип: {detail.product_type || "не задан"}
                                </div>
                                <div className="flex gap-3 mt-1.5 text-xs">
                                    <span className="text-slate-600">
                                        Заказ: <span className="font-medium">{detail.order_number}</span>
                                    </span>
                                    <span className="text-slate-600">
                                        Кол-во: <span className="font-medium">{detail.quantity}</span>
                                    </span>
                                    <span className="text-slate-600">
                                        Цена: <span className="font-medium">{parseFloat(detail.price).toLocaleString('ru-RU')} р.</span>
                                    </span>
                                </div>
                                {detail.agent_name && (
                                    <div className="text-xs text-purple-500 mt-1">
                                        Заказчик: {detail.agent_name}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-xs text-slate-400 mt-1 animate-pulse">Загрузка...</div>
                        )}
                    </div>
                    {/* Кнопка закрытия */}
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-lg self-start">x</button>
                </div>

                {/* Комментарии */}
                {detail && (detail.product_comments.length > 0 || detail.order_comments.length > 0 || detail.agent_comments.length > 0) && (
                    <div className="px-4 py-3 border-b border-slate-200">
                        <div className="text-[10px] text-slate-400 font-semibold mb-1.5">КОММЕНТАРИИ</div>
                        {detail.product_comments.map(c => (
                            <div key={`p-${c.id}`} className="text-[11px] text-green-700 leading-tight mb-0.5">
                                <span className="text-green-400">◉</span> {c.text}
                            </div>
                        ))}
                        {detail.order_comments.map(c => (
                            <div key={`o-${c.id}`} className="text-[11px] text-blue-600 leading-tight mb-0.5">
                                <span className="text-blue-400">▪</span> {c.text}
                            </div>
                        ))}
                        {detail.agent_comments.map(c => (
                            <div key={`a-${c.id}`} className="text-[11px] text-purple-600 leading-tight mb-0.5">
                                <span className="text-purple-400">★</span> {c.text}
                            </div>
                        ))}
                    </div>
                )}

                {/* Нормативы */}
                <div className="p-4">
                    <div className="text-[10px] text-slate-400 font-semibold mb-2">НОРМАТИВЫ (часов на 1 шт)</div>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-xs text-slate-500 border-b border-slate-100">
                                <th className="text-left py-1.5 font-medium">Цех</th>
                                <th className="text-center py-1.5 font-medium w-[80px]">Дефолт</th>
                                <th className="text-center py-1.5 font-medium w-[100px]">Своё</th>
                                <th className="w-[30px]"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {normRows.map(row => {
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
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    setEdits(prev => ({...prev, [row.department]: val}));
                                                    saveNorm(row.department, val);
                                                }}
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
                                                    onClick={() => {
                                                        setEdits(prev => ({...prev, [row.department]: ""}));
                                                        saveNorm(row.department, "");
                                                    }}
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
            </div>
        </div>
    );
};
