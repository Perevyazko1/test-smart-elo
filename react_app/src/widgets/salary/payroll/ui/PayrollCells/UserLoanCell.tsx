import {TT} from "@/shared/ui/tooltip/TT.tsx";
import {formatNumber} from "@/shared/utils/formatNumber.ts";
import {UserAddCell} from "@/widgets/salary/payroll/ui/PayrollCells/UserAddCell.tsx";
import type {IPayrollRow} from "@/entities/salary";
import type {IWeek} from "@/shared/utils/date.ts";


interface UserLoanCellProps {
    userInfo: IPayrollRow;
    week: IWeek;
    disabled: boolean;
}


export const UserLoanCell = (props: UserLoanCellProps) => {
    const {userInfo, week, disabled} = props;


    const loanPercent = 100 - Math.abs(
        Math.floor(
            userInfo.end_loan_sum / userInfo.full_loan_sum * 100
        )
    );


    const extraLoan = userInfo.full_loan_sum + userInfo.end_loan_sum !== 0 && (
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
    )

    return (
        <UserAddCell
            value={userInfo.loan_sum}
            hide={(userInfo.full_loan_sum + userInfo.end_loan_sum) === 0}
            info={"Внести погашение займа"}
            valueInfo={'Списано в счет погашения займов'}
            disabled={disabled}
            user={userInfo.user}
            week={week}
            earning_type={"ПОГ.ЗАЙМА"}
            about={`Списание ЗП в счет погашения займа нед ${week.weekNumber}`}
            extra={extraLoan}
        />
    );
};