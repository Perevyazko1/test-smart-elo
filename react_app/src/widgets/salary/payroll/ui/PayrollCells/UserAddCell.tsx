import {formatNumber} from "@/shared/utils/formatNumber.ts";
import {TT} from "@/shared/ui/tooltip/TT.tsx";
import {AddEarningBtn} from "@/widgets/cash/actions/AddEarningBtn.tsx";
import type {IWeek} from "@/shared/utils/date.ts";
import type {IEarningType} from "@/entities/salary";
import type {ReactNode} from "react";
import {twMerge} from "tailwind-merge";

interface UserAddCellProps {
    value: number;
    info: string;
    valueInfo: string;
    disabled: boolean;
    userId: number;
    week: IWeek;
    earning_type: IEarningType;
    about: string;
    extra?: ReactNode;
    hide?: boolean;
}

export const UserAddCell = (props: UserAddCellProps) => {
    const {value, hide = false, info, valueInfo, disabled, userId, week, earning_type, about, extra} = props;

    return (
        <td className="text-end relative">

            <div className={'flex items-center justify-between'}>
                <div className={twMerge(
                    'flex flex-1 justify-end pe-2 border-gray-400',
                    !hide && ('border-r-1'),
                )}>
                    <TT description={valueInfo}>
                        {formatNumber(value, false)}
                    </TT>
                </div>
                {!hide && (
                    <AddEarningBtn
                        disabled={disabled}
                        info={info}
                        week={week}
                        userId={userId}
                        earning_type={earning_type}
                        about={about}
                    />
                )}
            </div>

            {extra && (extra)}
        </td>
    );
};