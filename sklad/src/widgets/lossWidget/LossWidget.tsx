import {useMutation, useQueryClient} from "@tanstack/react-query";
import {createLoss} from "@/api/lossApi";
import {IAssortment, TListTypes} from "@/api/types";
import {useRef, useState} from "react";
import Image from "next/image";
import {editProduct} from "@/api/attributeApi";


interface LossWidgetProps {
    position: IAssortment;
    barcode: string;
    onSuccess: () => void;
    type: TListTypes;
    color: string;
}

export const LossWidget = (props: LossWidgetProps) => {
    const {position, barcode, type, onSuccess, color} = props;
    const queryClient = useQueryClient();

    const [inputValue, setInputValue] = useState<string>("1");
    const inputRef = useRef<HTMLInputElement>(null);

    const {mutate, isPending, error} = useMutation({
        mutationFn: createLoss,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['assortment', {param: barcode}]});
            alert(`${
                type === 'loss' ? "Списание внесено в систему!" :
                    type === 'enter' ? "Оприходование внесено в систему!" :
                        "Товар успешно инвентаризирован!"
            }`)
            onSuccess()
        },
    });

    const {mutate: setInv, isPending: isInv, error: invError} = useMutation({
        mutationFn: editProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['assortment', {param: barcode}]});
        },
    });


    const getListType = (): Omit<TListTypes, "inventory"> => {
        if (type !== "inventory") {
            return type;
        } else {
            if (parseFloat(inputValue) > position.stock) {
                return "enter";
            } else {
                return "loss";
            }
        }
    };

    const getQuantity = (): number => {
        if (type !== "inventory") {
            return parseFloat(inputValue);
        } else {
            if (parseFloat(inputValue) > position.stock) {
                return parseFloat(inputValue) - position.stock;
            } else {
                return position.quantity - parseFloat(inputValue);
            }
        }
    };

    const submitHandle = (e: React.FormEvent) => {
        e.preventDefault()
        inputRef.current?.blur()
        const storeRaw = localStorage.getItem('store');
        const organizationRaw = localStorage.getItem('organization');

        const store = storeRaw ? JSON.parse(storeRaw) : null;
        const organization = organizationRaw ? JSON.parse(organizationRaw) : null;

        if (isNaN(getQuantity())) {
            alert("Пожалуйста, введите корректное число!");
            return;
        }
        if (type === "loss" && getQuantity() > position.stock) {
            alert("Вы пытаетесь списать больше, чем есть на складе!");
            return;
        } else if (getQuantity() < 0) {
            alert("Нельзя списать/оприходовать отрицательное количество!");
            return;
        } else if (getQuantity() === 0) {
            alert("Введите количество!");
            return;
        } else {
            if (type === "inventory") {
                setInv({product: position})
            }
            mutate({
                type: getListType(),
                data: {
                    store,
                    organization,
                    positions: [{
                        quantity: getQuantity(),
                        assortment: {
                            meta: position.meta,
                        },
                    }],
                }
            });
        }
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        let value = event.target.value;

        // Разрешаем пустую строку, точку или корректные числа
        if (value === "" || value === ".") {
            setInputValue(value);
            return;
        }

        // Убираем ведущие нули, но сохраняем "0" или "0."
        if (value.startsWith("0") && !value.startsWith("0.") && value.length > 1) {
            value = value.replace(/^0+/, "");
        }

        // Проверяем, что строка соответствует формату числа (включая дробные)
        const isValidNumber = /^-?\d*\.?\d*$/.test(value);
        if (isValidNumber) {
            setInputValue(value);
        }
    };

    const getPositionImage = () => {
        if (position.images.rows.length > 0) {
            return position.images.rows[0].miniature.downloadHref;
        }
    };

    const positionImage = getPositionImage();

    const selectAll = (event: React.FocusEvent<HTMLInputElement>) => {
        // выделяем всё содержимое
        event.target.select();
    };

    return (
        <form className={'flex flex-col gap-3'} onSubmit={submitHandle}>
            <div>
                <span><b>{position.code} • </b> {position.name}</span>
            </div>
            <div className={'flex gap-1'}>
                {positionImage && (
                    <Image
                        style={{
                            maxHeight: "50%",
                        }}
                        alt={'Ткань'}
                        src={positionImage}
                        width={150}
                        height={150}
                    />
                )}
                <div>
                    Остаток: {position.quantity} {position.uom.name}
                </div>
            </div>

            {error && (
                <span>Ошибка: {error.name} {error.message}</span>
            )}

            {invError && (
                <span>Ошибка: {invError.name} {invError.message}</span>
            )}

            <div className={'flex p-1 items-center gap-2'}>
                КОЛ-ВО:
                <input
                    type={'text'}
                    ref={inputRef}
                    pattern="[0-9]*\.?[0-9]*"
                    autoFocus={true}
                    className={`p-2 w-[25%] border-gray-500 border-2 outline-0 focus:border-${color}-800 active:border-${color}-800`}
                    value={inputValue}
                    onChange={handleInputChange}
                    onFocus={selectAll}
                />
                {position.uom.name}
            </div>

            <button
                disabled={isPending || isInv}
                type={'submit'}
                className={`p-2 border-2 w-75 border-${color}-800 bg-${color}-100 disabled:bg-gray-500 disabled:animate-pulse`}
            >
                {type === 'loss' ? "Списать" :
                    type === 'enter' ? "Оприходовать"
                        : "Инвентаризировать"
                }
            </button>
        </form>
    );
};