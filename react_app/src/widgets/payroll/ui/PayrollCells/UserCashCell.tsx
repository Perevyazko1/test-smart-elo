import {type ChangeEvent, useEffect, useState} from "react";
import {DotFilledIcon} from "@radix-ui/react-icons";

import type {IPayrollRow} from "@/entities/salary";
import type {IWeek} from "@/shared/utils/date.ts";
import {TT} from "@/shared/ui/tooltip/TT.tsx";

interface UserCashCellProps {
    disabled: boolean;
    userInfo: IPayrollRow;
    onChange: (arg: number | null) => void;
    week: IWeek;
}

export const UserCashCell = (props: UserCashCellProps) => {
    const {disabled, userInfo, onChange} = props;

    // Начальное значение состояния теперь уменьшается в 100 раз.
    const [issuedInputValue, setIssuedInputValue] = useState<string>(
        userInfo.cash_payout ? String(userInfo.cash_payout / 100) : ''
    );

    useEffect(() => {
        // Здесь также уменьшаем значение в 100 раз при обновлении.
        setIssuedInputValue(userInfo.cash_payout ? String(userInfo.cash_payout / 100) : '');
    }, [userInfo.cash_payout]);

    const issuedChangeHandle = (e: ChangeEvent<HTMLInputElement>) => {
        const {value} = e.target;

        if (value === '') {
            setIssuedInputValue('');
            onChange(null);
            return;
        }

        const valueAsNumber = Number(value);

        if (isNaN(valueAsNumber) || valueAsNumber < 0) {
            return;
        }

        setIssuedInputValue(value);
        // Перед вызовом onChange увеличиваем значение в 100 раз,
        // чтобы оно соответствовало исходному формату.
        onChange(valueAsNumber * 100);
    };

    return (
        <td className="max-w-[7em] relative">
            {/* Здесь также уменьшаем значение в 100 раз для сравнения */}
            {(issuedInputValue && Number(issuedInputValue) !== (userInfo.cash_payout || 0) / 100) ? (
                <DotFilledIcon
                    className={'absolute top-0 right-0 text-green-800 animate-pulse'}
                />
            ) : null}

            <TT description={'Сумма к дальнейшей выдаче наличкой и ИП'}>
                <input
                    disabled={disabled}
                    type="number"
                    min={0}
                    step="0.01"
                    className={'p-2 font-mono w-full outline-none border-none text-end h-full bg-yellow-50 disabled:bg-transparent'}
                    value={issuedInputValue}
                    onChange={issuedChangeHandle}
                />
            </TT>
        </td>
    );
};