import {PlanCard} from "@/widgets/plan/planCard/PlanCard.tsx";
import {ProgressiveCell} from "@/widgets/plan/planCard/ProgressiveCell.tsx";
import {Btn} from "@/shared/ui/buttons/Btn.tsx";
import {CrossCircledIcon, CheckCircledIcon} from "@radix-ui/react-icons";
import type {IPlanDataRow} from "@/entities/plan";
import {APP_PERM, type IUser} from "@/entities/user";
import {toast} from "sonner";
import {$axios} from "@/shared/api";
import {planService} from "@/widgets/plan/model/api.ts";
import {useState} from "react";
import {usePlanSum} from "@/shared/state/plan/planSum.ts";
import {usePermission} from "@/shared/utils/permissions.ts";
import {useShipmentState} from "@/shared/state/shipment/shipmentState.ts";
import {PlusCircleIcon} from "lucide-react";
import {twMerge} from "tailwind-merge";

interface IProps {
    data: IPlanDataRow;
    index: number;
    sum: number;
}

export function PlanRow(props: IProps) {
    const {data, index, sum} = props;

    const [inputValue, setInputValue] = useState<string | undefined>(data.date ? new Date(data.date).toISOString().slice(0, 10) : '')

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
    }) => {
        toast.promise(planService.setTargetDate(data), {
                loading: 'Применение изменений 🔄️',
                success: () => {
                    return 'Дата успешно обновлена ✅';
                },
                error: 'Ошибка применения даты ❌',
            }
        )
    }

    const addItem = useShipmentState(s => s.addItem);
    const shipment = useShipmentState(s => s.shipment);
    const added = shipment.items.some(item => item.series_id === data.series_id)

    const updateHandle = () => {
        updateTargetDate({
            target_date: inputValue || null,
            series_id: data.series_id,
        })
    }

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
        <tr>
            <td
                className={data.price !== "0.00" ? currentStyle : 'bg-red-300'}
            >
                {index + 1} <br/>
                {showSums && (
                    <span className={'text-sm'}>
                        {Math.round(Number(data.price) / 1000).toLocaleString('ru-RU')}т.р.<br/>
                        {(sum / 1_000_000).toFixed(1)}м<br/>
                    </span>
                )}
            </td>
            <td className={'max-w-30'}>
                <input
                    type="date"
                    value={inputValue ? inputValue.slice(0, 10) : ''}
                    onChange={(e) => {
                        if (e.target.value) {
                            const date = new Date(e.target.value);
                            const isoDate = date.toISOString();
                            setInputValue(isoDate.slice(0, 10));
                        } else {
                            setInputValue('');
                        }
                    }}
                    className={'text-xs border-1 border-black p-1 w-full mb-1'}
                />
                <div className={'flex justify-evenly gap-1'}>
                    <Btn
                        className={'text-green-700 m-0 p-1 border-1 border-black'}
                        onClick={updateHandle}
                    >
                        <CheckCircledIcon/>
                    </Btn>
                    <Btn
                        className={'text-red-700 m-0 p-1 border-1 border-black'}
                        onClick={() => setInputValue("")}
                    >
                        <CrossCircledIcon/>
                    </Btn>

                    <Btn
                        className={
                            twMerge(
                                'm-0 p-1 outline-black transition-all duration-300',
                                added ? 'bg-green-300 text-red-700 outline-2' : 'text-amber-400 outline-1'
                            )

                        }
                        onClick={() => addItem(data)}
                    >
                        <PlusCircleIcon
                            className={
                                twMerge(
                                    'transition-all duration-300',
                                    added ? 'rotate-45' : 'rotate-0'
                                )
                            }
                            size={16}
                        />
                    </Btn>
                </div>
            </td>
            <td className={'max-w-15'}>
                <input
                    type="number"
                    defaultValue={data.quantity}
                    className={'text-xl max-w-full text-end'}
                />
            </td>
            <td><PlanCard data={data}/></td>
            <ProgressiveCell left={d1.ready} right={d1.all - d1.ready - d1.await} center={d1.await}/>
            <ProgressiveCell left={d2.ready} right={d2.all - d2.ready - d2.await} center={d2.await}/>
            <ProgressiveCell left={d3.ready} right={d3.all - d3.ready - d3.await} center={d3.await}/>
            <ProgressiveCell left={d4.ready} right={d4.all - d4.ready - d4.await} center={d4.await}/>
            <ProgressiveCell left={d5.ready} right={d5.all - d5.ready - d5.await} center={d5.await}/>

            {!planSum && (
                <ProgressiveCell left={d6.ready} right={d6.all - d6.ready - d6.await} center={d6.await}/>
            )}

            <ProgressiveCell left={data.shipped} right={data.quantity - data.shipped} center={0}/>
            <ProgressiveCell left={data.quantity - data.final_waiting} right={data.final_waiting} center={0}/>
        </tr>
    );
}