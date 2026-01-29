import {TariffCell} from "@/pages/tariffing/TariffCell.tsx";
import {STATIC_URL} from "@/shared/consts/serverConfig.ts";
import {twMerge} from "tailwind-merge";
import type {IRow, TariffRowsResponse} from "@/pages/tariffing/types.ts";
import {$axios} from "@/shared/api";
import {toast} from "sonner";
import {useMutation, useQueryClient} from "@tanstack/react-query";


interface Props {
    row: IRow;
    departments: string[];
}

export const TariffRow = (props: Props) => {
    const {row, departments} = props;

    const total = Object.values(row.steps ?? {}).reduce((sum, val) => (sum || 0) + (val?.proposed_amount || 0), 0) || 0;

    const percent = row.amount ? total / row.amount * 100 : 100;

    const confirmOp = () => {
        const promise = $axios.post<{ "updated": IRow[] }>(`/tariffs/confirm_op/`, {
            op_id: row.id,
        });

        toast.promise(promise, {
            loading: row.confirmed ? 'Отмена утверждения...' : 'Утверждение...',
            success: row.confirmed ? 'Подтверждение отменено' : 'Позиция заказа подтверждена',
            error: 'Ошибка подтверждения позиции заказа',
        });

        return promise;
    }

    const queryClient = useQueryClient();

    const {mutate, isPending} = useMutation({
        mutationFn: confirmOp,
        onSuccess: (response) => {
            const updatedRows = response.data.updated;
            queryClient.setQueriesData({queryKey: ['tariffData']}, (old: TariffRowsResponse | undefined) => {
                if (!old) return old;
                return {
                    ...old,
                    result: old.result.map(r => {
                        const updated = updatedRows.find(u => u.id === r.id);
                        return updated ? updated : r;
                    })
                };
            });
        }
    });

    return (
        <tr className={'h-px [&>td]:border [&>td]:border-slate-300 bg-white'}>
            <td className={twMerge(
                row.amount === 0 && 'bg-red-400',
            )}>
                <div>{row.series_id}</div>
                <div className={'text-right text-nowrap'}>
                    <b>{row.amount.toLocaleString('ru-RU')} ₽</b>
                </div>
            </td>
            <td>
                {row.quantity}
            </td>
            <td className={'w-16 h-16'}>
                <img
                    loading={'lazy'}
                    src={STATIC_URL + row.image}
                    alt="Chair"
                    className={'object-fill max-h-full max-w-full'}
                />
            </td>
            <td>
                <div>
                    <div><b>{row.project}</b></div>
                    <div>{row.product}</div>
                    <div>{row.fabric}</div>
                </div>
            </td>

            {departments.map((dep) =>
                row.steps?.[dep] ? (
                    <TariffCell
                        key={dep}
                        step={row.steps?.[dep] ?? null}
                    />
                ) : (
                    <td key={dep} className={'relative p-0 bg-gray-400'}></td>
                )
            )}

            <td className={twMerge(
                'flex p-0',
            )}>
                <div className={'flex flex-col justify-between flex-1 text-end'}>
                    <div className={'flex flex-row w-full relative min-h-[1.5rem]'}>
                        <div style={{
                            width: `${Math.round(percent / 14 * 100)}%`
                        }} className={'bg-red-400 h-full'}></div>
                        <div className={'bg-green-300 h-full flex-1'}></div>
                        <div className={'absolute right-0 top-0'}>
                            <b>
                                {percent.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}%
                            </b>
                        </div>
                    </div>

                    <div>{total.toLocaleString('ru-RU')}</div>
                    <button
                        disabled={isPending}
                        onClick={() => mutate()}
                        className={twMerge(
                            'w-full outline cursor-pointer',
                            row.confirmed ? '' : 'bg-yellow-300'
                        )}>
                        {row.confirmed ? 'x' : '✔'}
                    </button>
                </div>
            </td>
        </tr>
    );
};
