import {TT} from "@/shared/ui/tooltip/TT.tsx";
import {ConfirmEarningsBtn} from "@/widgets/salary/accrual/ConfirmEarningsBtn";
import type {IPayrollRow} from "@/entities/salary";
import type {IWeek} from "@/shared/utils/date";
import {twMerge} from "tailwind-merge";
import {formatNumber} from "@/shared/utils/formatNumber.ts";
import {AddEarningBtn} from "@/widgets/cash/actions/AddEarningBtn.tsx";


interface UserEarningsCellProps {
    userInfo: IPayrollRow;
    week: IWeek;
    disabled: boolean;
}


export const UserEarningsCell = (props: UserEarningsCellProps) => {
    const {userInfo, week, disabled} = props;

    return (

        <td>
            <div className={'flex items-center justify-between max-w-[7em] min-w-full'}>
                <TT asChild description={"Подтвердить сумму начислений"}>
                    <ConfirmEarningsBtn
                        userId={userInfo.user.id!}
                        week={week}
                        active={userInfo.has_unconfirmed && !userInfo.is_closed}
                    />
                </TT>


                <div className={
                    twMerge(
                        'flex flex-1 justify-end pe-2 border-gray-400',
                        userInfo.has_unconfirmed ?
                            'border-x-1'
                            : 'border-r-1'
                    )
                }>
                    <TT
                        description={
                            `ЭЛО: ${formatNumber(userInfo.earned_sum)}, ДОП: ${formatNumber(userInfo.bonus_sum)}`
                        }
                    >
                        {formatNumber(userInfo.earned_sum + userInfo.bonus_sum, false)}
                    </TT>
                </div>

                <AddEarningBtn
                    info={"Добавить ДОП начисление сотруднику"}
                    disabled={disabled}
                    week={week}
                    user={userInfo.user}
                    earning_type={"ДОП"}
                />
            </div>
        </td>
    );
};