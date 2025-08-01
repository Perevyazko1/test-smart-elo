import type {IPayrollRow} from "@/entities/salary";
import {TextArea} from "@/shared/ui/textarea/TextArea.tsx";
import type {IWeek} from "@/shared/utils/date.ts";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {type ChangeEvent, useState} from "react";
import {useDebounce} from "@/shared/utils/useDebounce.tsx";
import {DotFilledIcon} from "@radix-ui/react-icons";
import {twMerge} from "tailwind-merge";
import type {AxiosResponse} from "axios";
import {payrollService} from "../../model/api.ts";
import {SALARY_STATUSES} from "@/shared/consts";
import {formatNumber} from "@/shared/utils/formatNumber.ts";
import {UserCashCell} from "@/widgets/payroll/ui/PayrollCells/UserCashCell.tsx";
import {UserAddCell} from "@/widgets/payroll/ui/PayrollCells/UserAddCell.tsx";
import {UserLoanCell} from "@/widgets/payroll/ui/PayrollCells/UserLoanCell.tsx";
import {UserNameCell} from "@/widgets/payroll/ui/PayrollCells/UserNameCell.tsx";
import {TT} from "@/shared/ui/tooltip/TT.tsx";
import {NiceNum} from "@/shared/ui/text/NiceNum.tsx";
import {ConfirmEarningsBtn} from "@/widgets/salary/accrual/ConfirmEarningsBtn.tsx";


interface PayrollUserInfoProps {
    userInfo: IPayrollRow;
    week: IWeek;
    setSelectedUserId: (arg: number) => void;
    state: keyof typeof SALARY_STATUSES;
}

export const PayrollUserInfo = (props: PayrollUserInfoProps) => {
    const {userInfo, state, week, setSelectedUserId} = props;
    const queryClient = useQueryClient();

    const [commentInputValue, setCommentInputValue] = useState(userInfo.comment || "");

    const {mutate, isPending} = useMutation({
        mutationFn: payrollService.updatePayrollRow,
        onSuccess: (updatedData: AxiosResponse<IPayrollRow>) => {
            queryClient.setQueryData(['payrollRows', week.weekNumber], (oldRows: { data: IPayrollRow[] }) => {
                return {
                    ...oldRows,
                    data: oldRows.data.map(row =>
                        row.id === updatedData.data.id ? updatedData.data : row
                    )
                }
            });
            queryClient.setQueryData(['payrollRows', updatedData.data.id], updatedData.data);
        }
    });

    const debouncedUpdateRow = useDebounce(
        (data: {
            cash_payout?: number;
            comment?: string;
        }) => mutate({
            id: userInfo.id,
            ...data
        }),
        1000
    );


    const commentChangeHandle = (e: ChangeEvent<HTMLTextAreaElement>) => {
        e.preventDefault();
        const value = e.target.value;
        setCommentInputValue(value);
        debouncedUpdateRow({comment: value});
    }

    const statusLessThen = (status: keyof typeof SALARY_STATUSES) => {
        return Number(state) < Number(status);
    }


    return (
        <tr
            id={`payrollRow${userInfo.user.id}`}
            className={
                twMerge(
                    'transition-all duration-300 ease-in-out',
                    userInfo.is_closed ? 'bg-green-50' : '',
                    userInfo.is_locked ? 'bg-red-50' : '',
                )
            }
        >
            <UserNameCell
                mutateClb={mutate}
                isPending={isPending}
                userInfo={userInfo}
                setSelectedUserId={setSelectedUserId}
                week={week}
            />


            <td className="text-end">
                <TT description={`Баланс на начало ${week.weekNumber} нед.`}>
                    <NiceNum value={userInfo.hide_balance ? null : userInfo.balance_sum}/>
                </TT>
            </td>

            <UserAddCell
                value={(userInfo.earned_sum || 0) + (userInfo.bonus_sum || 0)}
                info={"Добавить ДОП начисление сотруднику"}
                valueInfo={`ЭЛО: ${formatNumber(userInfo.earned_sum)}, ДОП: ${formatNumber(userInfo.bonus_sum)}`}
                disabled={!statusLessThen("3") || userInfo.is_closed}
                user={userInfo.user}
                week={week}
                earning_type={"ДОП"}
                about={`ДОП за `}
            >
                {userInfo.has_unconfirmed && (
                    <TT asChild description={"Подтвердить сумму начислений"}>
                        <ConfirmEarningsBtn
                            userId={userInfo.user.id!}
                            week={week}
                            active={!userInfo.is_closed}
                        />
                    </TT>
                )}
            </UserAddCell>

            <UserCashCell
                week={week}
                disabled={!statusLessThen("6") || userInfo.is_locked}
                userInfo={userInfo}
                onChange={(value) => {
                    debouncedUpdateRow({cash_payout: value})
                }}
            />

            <UserAddCell
                value={userInfo.issued_sum}
                info={"Выдать сотруднику наличные ДС"}
                valueInfo={'Выдано наличными'}
                disabled={!statusLessThen("5") || userInfo.is_closed}
                user={userInfo.user}
                week={week}
                earning_type={"Выдача НАЛ"}
                about={`Выдача НАЛ ЗП нед ${week.weekNumber}`}
            />

            <UserAddCell
                value={userInfo.ip_sum}
                info={"Выдать сотруднику через средства ИП"}
                valueInfo={'Выдача на ИП сотрудника'}
                disabled={!statusLessThen("5") || userInfo.is_closed}
                user={userInfo.user}
                week={week}
                earning_type={"ИП"}
                about={`Выдача на ИП ЗП нед ${week.weekNumber}`}
            />

            <UserAddCell
                value={userInfo.card_sum}
                info={'Внести выдачу на карту или БН'}
                valueInfo={'Выдано на карту или по безналу'}
                disabled={!statusLessThen("6") || userInfo.is_closed}
                user={userInfo.user}
                week={week}
                earning_type={"На карту"}
                about={`Выдача безнал ЗП нед ${week.weekNumber}`}
            />

            <UserAddCell
                value={userInfo.tax_sum}
                info={'Добавить удержание налога и сборов'}
                valueInfo={'Удержано налога (НДФЛ и пр)'}
                disabled={!statusLessThen("6") || userInfo.is_closed}
                user={userInfo.user}
                week={week}
                earning_type={"Налог"}
                about={`Удержанный налог в ${week.weekNumber} неделе`}
            />

            <UserLoanCell
                disabled={!statusLessThen("4") || userInfo.is_closed}
                week={week}
                userInfo={userInfo}
            />

            <td className="relative">
                <div className={'flex items-center h-full text-[0.8em]'}>
                    <TextArea
                        disabled={!statusLessThen("6") || userInfo.is_locked}
                        className={'p-2 resize-none w-full bg-yellow-50 disabled:bg-transparent'}
                        value={commentInputValue}
                        onChange={commentChangeHandle}
                    />
                </div>
                {commentInputValue !== userInfo.comment && (
                    <DotFilledIcon
                        className={'absolute top-0 right-0 text-green-800 animate-pulse'}
                    />
                )}
            </td>
        </tr>
    );
};
