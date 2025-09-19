import {TT} from "@/shared/ui/tooltip/TT.tsx";
import {AddEarningBtn} from "@/widgets/cash/actions/AddEarningBtn.tsx";
import type {IWeek} from "@/shared/utils/date.ts";
import type {IEarningType} from "@/entities/salary";
import type {ReactNode} from "react";
import {twMerge} from "tailwind-merge";
import type {IUser} from "@/entities/user";
import {NiceNum} from "@/shared/ui/text/NiceNum.tsx";

interface UserAddCellProps {
    value: number | null;
    info: string;
    valueInfo: string;
    disabled: boolean;
    user: IUser | null;
    week: IWeek;
    earning_type: IEarningType;
    about: string;
    extra?: ReactNode;
    children?: ReactNode;
    hide?: boolean;
    className?: string;
    textClassName?: string;
    amount?: number;
}

export const UserAddCell = (props: UserAddCellProps) => {
    const {value, user, amount, className, textClassName, children, hide = false, info, valueInfo, disabled, week, earning_type, about, extra} = props;

    return (
        <td className={twMerge(
            "text-end relative",
            className
        )}>
            <div className={'flex items-center justify-between'}>
                {children}
                <div className={twMerge(
                    'flex flex-1 justify-end pe-2 border-gray-400',
                    !hide && ('border-r-1'),
                )}>
                    <TT description={valueInfo}>
                        <NiceNum value={value} className={textClassName}/>
                    </TT>
                </div>
                {!hide && (
                    <AddEarningBtn
                        disabled={disabled}
                        info={info}
                        target_date={week.date_from}
                        user={user}
                        earning_type={earning_type}
                        about={about}
                        amount={amount}
                    />
                )}
            </div>

            {extra && (extra)}
        </td>
    );
};