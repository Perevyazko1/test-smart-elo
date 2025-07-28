import {DotFilledIcon} from "@radix-ui/react-icons";
import {TT} from "@/shared/ui/tooltip/TT.tsx";
import {AddEarningBtn} from "@/widgets/cash/actions/AddEarningBtn.tsx";
import {twMerge} from "tailwind-merge";
import type {IPayrollRow} from "@/entities/salary";
import {type ChangeEvent, useState} from "react";
import type {IWeek} from "@/shared/utils/date.ts";

interface UserEarnWidgetProps {
    disabled: boolean;
    userInfo: IPayrollRow;
    onChange: (arg: number) => void;
    week: IWeek;
}

export const UserEarnWidget = (props: UserEarnWidgetProps) => {
    const {disabled, userInfo, onChange, week} = props;
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

    const cashPercent = Math.min(
        Math.floor((Math.abs(userInfo.issued_sum) / userInfo.cash_payout) * 100),
        115
    );


    return (
        <>
            {(issuedInputValue && issuedInputValue !== userInfo.cash_payout) ? (
                <DotFilledIcon
                    className={'absolute top-0 right-0 text-green-800 animate-pulse'}
                />
            ) : null}

            <div className={'flex items-center justify-between gap-2'}>
                <input
                    disabled={disabled || userInfo.is_closed}
                    type="text"
                    className={'p-2 w-full outline-none border-none text-end h-full bg-yellow-50 disabled:bg-transparent'}
                    value={issuedInputValue?.toLocaleString('ru-RU')}
                    onChange={issuedChangeHandle}
                />

                <TT asChild description={'Выдать сотруднику наличные ДС'}>
                    <AddEarningBtn
                        disabled={disabled || userInfo.is_closed}
                        week={week}
                        userId={userInfo.user_id}
                        earning_type={"Выдача НАЛ"}
                        about={`ЗП нед ${week.weekNumber}`}
                    />
                </TT>
            </div>

            {userInfo.issued_sum !== 0 && (
                <>
                    <div className={'absolute bottom-0 left-0 right-0 h-1 w-full'}>
                        <div
                            style={{
                                width: `${cashPercent}%`,
                            }}
                            className={twMerge([
                                Math.abs(userInfo.issued_sum) === userInfo.cash_payout ? 'bg-green-100' : 'bg-yellow-100',
                                'h-full'
                            ])}/>
                    </div>
                    <div className={'absolute bottom-[0.1em] left-1 text-[0.7em] font-bold'}>
                        {Math.abs(userInfo.issued_sum).toLocaleString('ru-RU')}
                    </div>
                </>
            )}
        </>
    );
};