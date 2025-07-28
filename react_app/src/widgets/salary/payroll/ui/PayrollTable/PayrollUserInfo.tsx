import type {IPayrollRow} from "@/entities/salary";
import {TextArea} from "@/shared/ui/textarea/TextArea.tsx";
import {Btn} from "@/shared/ui/buttons/Btn.tsx";
import {AddEarningBtn} from "@/widgets/cash/actions/AddEarningBtn.tsx";
import type {IWeek} from "@/shared/utils/date.ts";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {type ChangeEvent, useState} from "react";
import {useDebounce} from "@/shared/utils/useDebounce.tsx";
import {DotFilledIcon, ExitIcon, LockClosedIcon} from "@radix-ui/react-icons";
import {Toggle} from "@/components/ui/toggle.tsx";
import {LockOpen} from "lucide-react";
import {twMerge} from "tailwind-merge";
import type {AxiosResponse} from "axios";
import {payrollService} from "../../model/api";
import {ConfirmEarningsBtn} from "@/widgets/salary/accrual/ConfirmEarningsBtn.tsx";
import {SALARY_STATUSES} from "@/shared/consts";
import {TT} from "@/shared/ui/tooltip/TT.tsx";
import {UserLoanWidget} from "@/widgets/salary/payroll/ui/PayrollTable/UserLoanWidget.tsx";
import {formatNumber} from "@/shared/utils/formatNumber.ts";
import {UserEarnWidget} from "@/widgets/salary/payroll/ui/PayrollTable/UserEarnWidget.tsx";


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

    const updatePayrollRowMutation = useMutation({
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
        }) => updatePayrollRowMutation.mutate({
            id: userInfo.id,
            ...data
        }),
        1000
    );

    const closeRow = useMutation({
        mutationFn: payrollService.closePayrollRow,
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
    })

    const commentChangeHandle = (e: ChangeEvent<HTMLTextAreaElement>) => {
        e.preventDefault();
        const value = e.target.value;
        setCommentInputValue(value);
        debouncedUpdateRow({comment: value});
    }

    const statusLessThen = (status: keyof typeof SALARY_STATUSES) => {
        return Number(state) < Number(status);
    }

    const closeWeekRowHandle = () => {
        if (window.confirm("Закрыть расчеты по текущей неделе с сотрудником для расчета баланса?")) {
            closeRow.mutate({payroll_row_id: userInfo.id})
        }
    }

    return (
        <tr
            id={`payrollRow${userInfo.user_id}`}
            className={
                twMerge(
                    'transition-all duration-300 ease-in-out',
                    userInfo.is_closed ? 'bg-green-100' : '',
                )
            }
        >
            <td>
                <div className="flex justify-between flex-nowrap">
                    <div className="flex items-center">
                        <Toggle
                            disabled={updatePayrollRowMutation.isPending}
                            className={'cursor-pointer'}
                            pressed={userInfo.is_locked}
                            onPressedChange={() => updatePayrollRowMutation.mutate({
                                id: userInfo.id,
                                is_locked: !userInfo.is_locked
                            })}
                        >
                            {userInfo.is_locked ? (
                                <LockClosedIcon className={'text-red-800'}/>
                            ) : (
                                <LockOpen className={'text-green-800'}/>
                            )}
                        </Toggle>

                        <Btn
                            className={"text-nowrap"}
                            onClick={() => setSelectedUserId(userInfo.user_id)}
                        >
                            {userInfo.name}
                        </Btn>
                    </div>

                    <TT asChild description={"Закрыть неделю по сотруднику"}>
                        <Btn
                            disabled={userInfo.is_closed}
                            className={'text-16 bg-transparent px-2'}
                            name={'Payroll'}
                            onClick={closeWeekRowHandle}
                        >
                            <ExitIcon/>
                        </Btn>
                    </TT>
                </div>
            </td>


            <td className="text-end">
                {formatNumber(userInfo.start_balance, false)}
            </td>

            <td>
                <div className={'flex items-center justify-between max-w-[7em] min-w-full'}>
                    <TT asChild description={"Подтвердить сумму начислений"}>
                        <ConfirmEarningsBtn
                            userId={userInfo.user_id}
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

                    <TT asChild description={'Добавить ДОП начисление сотруднику'}>
                        <AddEarningBtn
                            disabled={!statusLessThen("3") || userInfo.is_closed}
                            week={week}
                            userId={userInfo.user_id}
                            earning_type={"ДОП"}
                        />
                    </TT>
                </div>
            </td>

            <td className="w-[10em] relative">
                <UserEarnWidget
                    week={week}
                    disabled={!statusLessThen("5")}
                    userInfo={userInfo}
                    onChange={(value) => {
                        debouncedUpdateRow({cash_payout: value})
                    }}
                />
            </td>
            <td>
                <div className={'flex items-center justify-between'}>
                    <div className={'flex-1 text-end border-r-1 border-gray-400 pe-2'}>
                        {formatNumber(userInfo.card_sum)}
                    </div>
                    <TT asChild description={'Внести выдачу на карту или БН'}>
                        <AddEarningBtn
                            disabled={!statusLessThen("6") || userInfo.is_closed}
                            week={week}
                            userId={userInfo.user_id}
                            earning_type={"На карту"}
                        />
                    </TT>
                </div>
            </td>
            <td>
                <div className={'flex items-center justify-between'}>
                    <div className={'flex-1 text-end border-r-1 border-gray-400 pe-2'}>
                        {formatNumber(userInfo.tax_sum)}
                    </div>
                    <TT asChild description={'Добавить удержание налога и сборов'}>
                        <AddEarningBtn
                            disabled={!statusLessThen("6") || userInfo.is_closed}
                            week={week}
                            userId={userInfo.user_id}
                            earning_type={"Налог"}
                        />
                    </TT>
                </div>
            </td>

            <td className={'relative'}>
                <UserLoanWidget
                    disabled={!statusLessThen("4")}
                    userInfo={userInfo}
                    week={week}
                />
            </td>
            <td className="relative">
                <div className={'flex items-center h-full text-[0.8em]'}>
                    <TextArea
                        disabled={!statusLessThen("6") || userInfo.is_closed}
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
