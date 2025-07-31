import {type ChangeEvent, useState} from "react";
import {DotFilledIcon} from "@radix-ui/react-icons";

import type {IPayrollRow} from "@/entities/salary";
import type {IWeek} from "@/shared/utils/date.ts";
import {TT} from "@/shared/ui/tooltip/TT.tsx";


interface UserCashCellProps {
    disabled: boolean;
    userInfo: IPayrollRow;
    onChange: (arg: number) => void;
    week: IWeek;
}


export const UserCashCell = (props: UserCashCellProps) => {
    const {disabled, userInfo, onChange} = props;
    const [issuedInputValue, setIssuedInputValue] = useState(userInfo.cash_payout || undefined);


    const issuedChangeHandle = (e: ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        const value = Number(e.target.value.replace(/[^\d]/g, ''));

        if (isNaN(value) || value < 0) {
            return;
        }

        setIssuedInputValue(value);
        onChange(value);
    }

    return (
        <td className="max-w-[7em] relative">
            {(issuedInputValue && issuedInputValue !== userInfo.cash_payout) ? (
                <DotFilledIcon
                    className={'absolute top-0 right-0 text-green-800 animate-pulse'}
                />
            ) : null}

            <TT description={'Сумма к дальнейшей выдаче наличкой и ИП'}>
                <input
                    disabled={disabled}
                    type="text"
                    className={'p-2 font-mono w-full outline-none border-none text-end h-full bg-yellow-50 disabled:bg-transparent'}
                    value={issuedInputValue?.toLocaleString('ru-RU')}
                    onChange={issuedChangeHandle}
                />
            </TT>
        </td>
    );
};