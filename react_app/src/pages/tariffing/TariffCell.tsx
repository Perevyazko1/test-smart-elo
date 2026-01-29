import {type FocusEvent, useId, useState} from "react";
import {twMerge} from "tailwind-merge";
import {NumericFormat} from "react-number-format";
import type {IRow, IStep, TariffRowsResponse} from "@/pages/tariffing/types.ts";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {$axios} from "@/shared/api";
import {toast} from "sonner";
import {useDebouncedCallback} from "@tanstack/react-pacer";
import {useProject} from "@/pages/tariffing/TariffingNav.tsx";


interface Props {
    step: IStep;
}

export const TariffCell = (props: Props) => {
    const {step} = props;
    const inputId = useId();
    const [inputValue, setInputValue] = useState<number>(step?.proposed_amount ?? 0);

    const showAll = useProject(s => s.showAll);
    const product = useProject(s => s.product);

    const queryClient = useQueryClient();

    const setTariff = () => {
        const promise = $axios.post<{ "updated": IRow[] }>(`/tariffs/update_tariff_data/`, {
            step_id: step.id,
            amount: inputValue,
            product: product,
            showAll: showAll,
        });

        toast.promise(promise, {
            loading: 'Обновление...',
            success: 'Тариф предложен',
            error: 'Ошибка обновления тарифа',
        });

        return promise;
    }


    const mutation = useMutation({
        mutationFn: setTariff,
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

    const debouncedUpdate = useDebouncedCallback(
        () => mutation.mutate(),
        {wait: 500}
    )

    const confirmTariff = () => {
        const promise = $axios.post<{ "updated": IRow[] }>(`/tariffs/set_confirmed_tariff/`, {
            step_id: step.id,
            amount: inputValue,
        });

        toast.promise(promise, {
            loading: 'Утверждение...',
            success: 'Тариф утвержден',
            error: 'Ошибка утверждения тарифа',
        });

        return promise;
    }


    const mutationConfirm = useMutation({
        mutationFn: confirmTariff,
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
        <td className={twMerge(
            'relative p-0',
            step.amount !== step.proposed_amount ? 'bg-yellow-100' : 'bg-green-100',
        )}>
            {step.amount !== step.proposed_amount && (
                <span className={'absolute top-0 left-0 w-full text-end font-mono z-2 bg-amber-400'}>
                {step.amount}
            </span>
            )}
            <NumericFormat
                key={inputId}
                value={inputValue ?? 0}
                onValueChange={(values) => {
                    const cents = values.value === '' ? 0 : parseInt(values.value);
                    setInputValue(cents);
                    debouncedUpdate();
                }}
                onFocus={(e: FocusEvent<HTMLInputElement>) => {
                    e.target.select();
                }}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        (e.target as HTMLInputElement).blur();
                    }
                }}
                decimalScale={0}
                allowNegative={false}
                thousandSeparator=" "
                decimalSeparator=","
                placeholder="0"
                className={twMerge(
                    'font-mono absolute top-0 left-0 w-full h-full',
                    'border-none outline-none fw-bold text-right z-1'
                )}
                type="text"
            />
            {step.amount !== step.proposed_amount && (
                <button
                    onClick={() => mutationConfirm.mutate()}
                    className={twMerge(
                        'absolute bottom-0 left-0 z-2 w-full',
                        'outline bg-green-300 cursor-pointer border-none'
                    )}
                >
                    ✅
                </button>
            )}
        </td>
    );
};
