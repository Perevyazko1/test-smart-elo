import {TT} from "@/shared/ui/tooltip/TT.tsx";
import {formatNumber} from "@/shared/utils/formatNumber.ts";
import {UserAddCell} from "@/widgets/payroll/ui/PayrollCells/UserAddCell.tsx";
import type {IPayrollRow} from "@/entities/salary";
import type {IWeek} from "@/shared/utils/date.ts";
import {NiceNum} from "@/shared/ui/text/NiceNum.tsx";


interface UserLoanCellProps {
    userInfo: IPayrollRow;
    week: IWeek;
    disabled: boolean;
    className?: string;
    amount?: number;
}


export const UserLoanCell = (props: UserLoanCellProps) => {
    const {userInfo, amount, className, week, disabled} = props;


    const loanPercent = 100 - Math.abs(
        Math.floor(
            (userInfo.end_loan_sum || 0) / (userInfo.full_loan_sum || 0) * 100
        )
    );


    const extraLoan = (userInfo.full_loan_sum || 0) + (userInfo.end_loan_sum || 0) !== 0 && (
        <>
            <div className={'absolute bottom-0 left-0 right-0 h-1 w-full noPrint'}>
                <div
                    style={{
                        width: `${loanPercent}%`,
                    }}
                    className={'bg-purple-100 h-full'}/>
            </div>

            <div className={'absolute bottom-[0.1em] left-1 text-[0.7em] font-bold noPrint'}>
                <TT description={
                    `Погашено ${formatNumber(userInfo.end_loan_sum)} 
                    из ${formatNumber(userInfo.full_loan_sum)}`
                }>
                    <NiceNum value={(userInfo.full_loan_sum || 0) + (userInfo.end_loan_sum || 0)} abs/>
                </TT>
            </div>
        </>
    )

    return (
        <UserAddCell
            className={className}
            value={userInfo.loan_sum}
            hide={((userInfo.full_loan_sum || 0) + (userInfo.end_loan_sum || 0)) === 0}
            info={
                disabled ? "Блок - статус либо закрыта неделя" :
                    "Внести погашение займа"
            }
            valueInfo={'Списано в счет погашения займов'}
            disabled={disabled}
            user={userInfo.user}
            week={week}
            earning_type={"ПОГ.ЗАЙМА"}
            about={`Списание ЗП в счет погашения займа нед ${week.weekNumber}`}
            extra={extraLoan}
            amount={amount}
        />
    );
};