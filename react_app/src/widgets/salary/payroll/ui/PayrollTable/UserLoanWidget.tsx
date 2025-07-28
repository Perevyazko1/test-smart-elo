import type {IPayrollRow} from "@/entities/salary";
import {TT} from "@/shared/ui/tooltip/TT.tsx";
import {AddEarningBtn} from "@/widgets/cash/actions/AddEarningBtn";
import {twMerge} from "tailwind-merge";
import type {IWeek} from "@/shared/utils/date.ts";
import {formatNumber} from "@/shared/utils/formatNumber.ts";
import {AlertTriangle} from "lucide-react";


interface UserLoanWidgetProps {
    disabled: boolean;
    userInfo: IPayrollRow;
    week: IWeek;
}


export const UserLoanWidget = (props: UserLoanWidgetProps) => {
    const {disabled, userInfo, week} = props;

    const loanPercent = 100 - Math.abs(
        Math.floor(
            userInfo.end_loan_sum / userInfo.full_loan_sum * 100
        )
    );

    return (
        <>
            <div className={'flex items-center justify-between'}>
                {
                    (Math.abs(userInfo.end_loan_sum )> userInfo.full_loan_sum) && (
                        <AlertTriangle
                            className={'text-red-800'}
                        />
                    )
                }

                <div className={
                    twMerge(
                        'flex flex-1 justify-end pe-2 border-gray-400',
                        userInfo.loan_sum && ('border-r-1'),
                    )
                }>
                    <TT description={'Списано в счет погашения займов'}>
                        {formatNumber(userInfo.loan_sum)}
                    </TT>
                </div>

                {userInfo.full_loan_sum ? (
                    <TT asChild description={"Внести погашение займа"}>
                        <AddEarningBtn
                            disabled={disabled || userInfo.is_closed}
                            week={week}
                            userId={userInfo.user_id}
                            earning_type={"ПОГ.ЗАЙМА"}
                        />
                    </TT>
                ) : null}
            </div>

            {userInfo.full_loan_sum + userInfo.end_loan_sum !== 0 && (
                <>
                    <div className={'absolute bottom-0 left-0 right-0 h-1 w-full'}>
                        <div
                            style={{
                                width: `${loanPercent}%`,
                            }}
                            className={'bg-purple-100 h-full'}/>
                    </div>

                    <div className={'absolute bottom-[0.1em] left-1 text-[0.7em] font-bold'}>
                        <TT description={
                            `Погашено ${formatNumber(userInfo.end_loan_sum)} 
                    из ${formatNumber(userInfo.full_loan_sum)}`
                        }>
                            {Math.abs(
                                userInfo.full_loan_sum + userInfo.end_loan_sum
                            ).toLocaleString('ru-RU')}
                        </TT>
                    </div>
                </>
            )}
        </>
    );
};