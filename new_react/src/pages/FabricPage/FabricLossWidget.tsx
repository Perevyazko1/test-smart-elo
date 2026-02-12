import {AppInput} from "@shared/ui";
import {useState} from "react";
import {toast} from "sonner";
import {useAppModal} from "@shared/hooks";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {$axiosAPI} from "@shared/api";
import {IFabric} from "@pages/FabricPage/types";

interface Props {
    maxValue?: number;
    defaultValue?: number;
    targetName?: string;
    fabric: IFabric;
    variant: "sklad" | "await" | "stock";
}

export const FabricLossWidget = (props: Props) => {
    const {maxValue, defaultValue, targetName, fabric, variant} = props;

    const [inputValue, setInputValue] = useState<string | undefined>(defaultValue ? String(defaultValue) : undefined);
    const {handleClose} = useAppModal();

    const queryClient = useQueryClient();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (maxValue && Number(value) > maxValue) {
            setInputValue(String(maxValue));
        } else {
            setInputValue(value);
        }
    }

    const {mutateAsync, error} = useMutation({
        mutationFn: () => $axiosAPI.post(variant === "await" ? "/sklad/create_supply/" : '/sklad/create_loss/', {
            fabric_id: fabric.product_id,
            quantity: Number(inputValue),
            order_id: fabric.order_id,
        }),
        onSettled: async () => {
            return await Promise.all([
                queryClient.invalidateQueries({queryKey: ['fabricSklad']}),
                queryClient.invalidateQueries({queryKey: ['fabricAwait']}),
                queryClient.invalidateQueries({queryKey: ['fabricStock']}),
            ])
        }
    });

    const handleSubmit = () => {
        toast.promise(
            mutateAsync(),
            {
                loading: variant === "await" ? 'Создание документа приемки...' : 'Создание документа списания...',
                success: () => {
                    handleClose()
                    return variant === "await" ? 'Приемка успешно' : 'Списание успешно'
                },
                error: 'Ошибка при операции',
            }
        );
    }

    return (
        <div className={'p-5 d-flex flex-column gap-5'}>
            <div>Введите количество к <b>{variant === "await" ? 'ПРИЕМКЕ' : 'СПИСАНИЮ'}</b></div>

            {targetName && (
                <div>{targetName}</div>
            )}

            <div className={'d-flex gap-2 align-items-center'}>
                <AppInput
                    type={'number'}
                    value={inputValue}
                    autoFocus
                    onChange={handleChange}
                /> ПОГ.М
            </div>

            <button
                className={'appBtn greyBtn py-2'}
                onClick={handleSubmit}
            >
                {variant === "await" ? 'ПРИНЯТЬ' : 'СПИСАТЬ'}
            </button>

            {error && <div className={'text-danger'}>{error.message}</div>}
        </div>
    );
};
