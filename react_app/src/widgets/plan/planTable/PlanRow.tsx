import {PlanCard} from "@/widgets/plan/planCard/PlanCard.tsx";
import {ProgressiveCell} from "@/widgets/plan/planCard/ProgressiveCell.tsx";
import {Btn} from "@/shared/ui/buttons/Btn.tsx";
import {CrossCircledIcon} from "@radix-ui/react-icons";
import type {IPlanDataRow} from "@/entities/plan";
import {APP_PERM} from "@/entities/user";
import {toast} from "sonner";
import {useEffect, useRef, useState} from "react";
import {usePlanSum} from "@/shared/state/plan/planSum.ts";
import {usePermission} from "@/shared/utils/permissions.ts";
import {twMerge} from "tailwind-merge";
import {ButtonGroup} from "@/components/ui/button-group.tsx";
import {$axios} from "@/shared/api";


interface IProps {
    data: IPlanDataRow;
    index: number;
    sum: number;
}


export function PlanRow(props: IProps) {
    const {data, index, sum} = props;

    // Нормализация даты к формату YYYY-MM-DD (строка) либо ""
    const normalizeDate = (value?: string | null) => {
        if (!value) return "";
        try {
            return new Date(value).toISOString().slice(0, 10);
        } catch {
            return "";
        }
    };

    const originalValueRef = useRef<string>(normalizeDate(data.date as unknown as string | null));
    const [dateValue, setDateValue] = useState<string>(originalValueRef.current);
    const [quantityValue, setQuantityValue] = useState<number>(data.quantity);
    const [urgency, setUrgency] = useState(data.urgency);
    // Запоминаем, что уже отправляли, чтобы не дублировать запрос при HMR/StrictMode
    const lastSentRef = useRef<string | null>(null);

    const showSums = usePermission([
        APP_PERM.KPI_PAGE,
        APP_PERM.ADMIN,
    ]);

    const planSum = usePlanSum(s => s.planSum);
    const weekStyles = [
        'bg-teal-100',
        'bg-amber-100',
        'bg-red-100',
        'bg-violet-100',
        'bg-neutral-200',
    ]
    const currentStyle = weekStyles[
        Math.floor(sum / ((planSum || 0) / 5))
        ] || weekStyles[0];

    const updateTargetDate = (data: {
        target_date: string | null;
        series_id: string;
        quantity: number;
        date_from: string | null;
        urgency: 1 | 2 | 3;
        old_urgency: 1 | 2 | 3;
    }) => {
        toast.promise($axios.post<{ success: boolean }>(
                `/plan/set_target_date/`,
                data,
            ), {
                loading: 'Применение изменений 🔄️',
                success: () => {
                    return 'Дата успешно обновлена ✅';
                },
                error: 'Ошибка применения даты ❌',
            }
        )
    }


    // Синхронизация с приходящими данными: если дата в props поменялась — обновляем локальное состояние
    useEffect(() => {
        const next = normalizeDate((data as any).date ?? null);
        originalValueRef.current = next;
        setDateValue(next);
        lastSentRef.current = `${next}|${data.urgency}`; // чтобы не слать сразу повторный запрос
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.date, data.urgency]);

    // Авто‑обновление даты с дебаунсом и защитой от бесконечных запросов при HMR/StrictMode
    useEffect(() => {
        const currentKey = `${dateValue}|${urgency}`;
        // Не отправляем, если значение совпадает с исходным из props (mount/refresh)
        if (dateValue === originalValueRef.current && urgency === data.urgency) return;
        // Не отправляем одно и то же значение повторно
        if (lastSentRef.current === currentKey) return;

        const timer = setTimeout(() => {
            // Повторная проверка в момент отправки (на случай двойного вызова эффекта в StrictMode)
            if (lastSentRef.current === currentKey) return;
            lastSentRef.current = currentKey;
            updateTargetDate({
                target_date: dateValue || null,
                date_from: originalValueRef.current || null,
                quantity: quantityValue,
                series_id: data.series_id,
                urgency: urgency,
                old_urgency: data.urgency,
            });
        }, 600); // небольшой дебаунс, чтобы не спамить при быстрых изменениях

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dateValue, data.series_id, urgency]);

    const empty = {
        "all": 0,
        "ready": 0,
    }
    const d1 = data.assignments["Конструктора"] || empty;
    const d2 = data.assignments["Сборка"] || empty;
    const d3 = data.assignments["Пошив"] || empty;
    const d4 = data.assignments["Малярка"] || empty;
    const d5 = data.assignments["Обивка"] || empty;
    const d6 = data.assignments["Упаковка"] || empty;

    return (
        <tr className={twMerge(
            "print:max-h-[20px] print:overflow-hidden print:whitespace-nowrap print:text-xs",
            urgency === 1 ? 'bg-red-100' :
                urgency === 2 ? 'bg-yellow-100' :
                    urgency === 3 ? '' : ''
        )}>
            <td
                className={twMerge(
                    'text-[9px]',
                    data.price !== "0.00" ? currentStyle : 'bg-red-300'
                )}
            >
                {index + 1} <br/>
                {showSums && (
                    <span>
                        {Math.round(Number(data.price) / 1000).toLocaleString('ru-RU')}т.р.<br/>
                        {(sum / 1_000_000).toFixed(1)}м<br/>
                    </span>
                )}
            </td>
            <td className={'max-w-30'}>
                <input
                    type="date"
                    value={dateValue || ''}
                    onChange={(e) => {
                        const v = e.target.value;
                        setDateValue(v ? normalizeDate(v) : "");
                    }}
                    className={'text-xs border-1 border-black p-1 w-full mb-1'}
                />
                <div className="w-full">
                    <ButtonGroup className="w-full grid grid-cols-4">
                        <Btn
                            className={
                                twMerge(
                                    'text-red-700 m-0 p-1 border-1 font-bold border-black flex-1',
                                    urgency === 1 && 'bg-red-300'
                                )
                            }
                            onClick={() => setUrgency(1)}
                        >
                            1
                        </Btn>
                        <Btn
                            className={
                                twMerge(
                                    'text-yellow-700 m-0 p-1 border-1  font-bold border-black flex-1',
                                    urgency === 2 && 'bg-yellow-300'
                                )}
                            onClick={() => setUrgency(2)}
                        >
                            2
                        </Btn>
                        <Btn

                            className={
                                twMerge(
                                    'text-green-700 m-0 p-1 border-1 border-black flex-1',
                                    urgency === 3 && 'bg-green-300'
                                )}
                            onClick={() => setUrgency(3)}
                        >
                            3
                        </Btn>
                        <Btn
                            className={'text-red-700 m-0 p-1 border-1 border-black flex-1'}
                            onClick={() => {
                                setUrgency(3)
                                setDateValue("")
                            }
                            }
                        >
                            <CrossCircledIcon/>
                        </Btn>
                    </ButtonGroup>
                </div>
            </td>
            <td className={'max-w-15'}>
                <input
                    type="number"
                    value={quantityValue}
                    max={data.quantity}
                    min={1}
                    onChange={(e) => {
                        const v = Number(e.target.value);
                        setQuantityValue(isNaN(v) ? 0 : v);
                    }}
                    className={'text-xl max-w-full text-end'}
                />
                {data.quantity !== data.all_quantity && (
                    <div className={'fw-bold'}>из {data.all_quantity}</div>
                )}
            </td>
            <td><PlanCard data={data}/></td>
            <ProgressiveCell left={d1.ready} right={d1.all - d1.ready - d1.await} center={d1.await} className={'print:max-w-[3em]'}/>
            <ProgressiveCell left={d2.ready} right={d2.all - d2.ready - d2.await} center={d2.await} className={'print:max-w-[3em]'}/>
            <ProgressiveCell left={d3.ready} right={d3.all - d3.ready - d3.await} center={d3.await} className={'print:max-w-[3em]'}/>
            <ProgressiveCell left={d4.ready} right={d4.all - d4.ready - d4.await} center={d4.await} className={'print:max-w-[3em]'}/>
            <ProgressiveCell left={d5.ready} right={d5.all - d5.ready - d5.await} center={d5.await} className={'print:max-w-[3em]'}/>
            <ProgressiveCell left={d6.ready} right={d6.all - d6.ready - d6.await} center={d6.await}
                             className={"noPrint print:max-w-[3em]"}/>
            <ProgressiveCell
                left={data.quantity - data.final_waiting}
                right={data.final_waiting}
                center={0}
                className={'print:max-w-[3em]'}
            />
        </tr>
    );
}