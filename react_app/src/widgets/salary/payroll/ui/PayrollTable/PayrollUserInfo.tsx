import type {IPayrollRow} from "@/entities/salary";
import {TextArea} from "@/shared/ui/textarea/TextArea.tsx";
import {Btn} from "@/shared/ui/buttons/Btn.tsx";
import {AddEarningBtn} from "@/widgets/salary/accrual/AddEarningBtn.tsx";
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


interface PayrollUserInfoProps {
    userInfo: IPayrollRow;
    week: IWeek;
    setSelectedUserId: (arg: number) => void;
    state: keyof typeof SALARY_STATUSES;
}

export const PayrollUserInfo = (props: PayrollUserInfoProps) => {
    const {userInfo, state, week, setSelectedUserId} = props;
    const queryClient = useQueryClient();

    const [issuedInputValue, setIssuedInputValue] = useState(userInfo.cash_payout || undefined);
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

    const issuedChangeHandle = (e: ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        const value = Number(e.target.value.replace(/[^\d]/g, ''));

        if (isNaN(value) || value < 0) {
            return;
        }

        setIssuedInputValue(value);
        debouncedUpdateRow({cash_payout: value});
    }

    const formatNumber = (value: number | null, abs: boolean = true) => {
        if (!value) {
            return "";
        }
        if (abs) {
            return Math.abs(value).toLocaleString('ru-RU');
        }
        return value.toLocaleString('ru-RU');
    }

    const cashPercent =
        Math.min(
            Math.floor((Math.abs(userInfo.issued_sum) / userInfo.cash_payout) * 100),
            115
        );

    const statusLessThen = (status: keyof typeof SALARY_STATUSES) => {
        return Number(state) < Number(status);
    }

    const closeWeekRowHandle = () => {
        if (window.confirm("Закрыть расчеты по текущей неделе с сотрудником для расчета баланса?")) {
            closeRow.mutate({payroll_row_id: userInfo.id})
        }
    }

    return (
        <tr id={`payrollRow${userInfo.user_id}`}>
            <td className="py-0 px-4 border border-gray-300 flex justify-between flex-nowrap">
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
                        bg={'white'}
                        className={"text-nowrap"}
                        onClick={() => setSelectedUserId(userInfo.user_id)}
                    >
                        {userInfo.name}
                    </Btn>
                </div>

                <TT description={"Закрыть неделю по сотруднику"}>
                    <Btn
                        disabled={userInfo.is_closed}
                        className={'text-16 bg-transparent px-2'}
                        name={'Payroll'}
                        onClick={closeWeekRowHandle}
                    >
                        <ExitIcon/>
                    </Btn>
                </TT>
            </td>

            <td className="py-0 px-4 border border-gray-300">
                {formatNumber(userInfo.start_balance, false)}
            </td>

            <td className="border border-gray-300 max-w-[7em]">
                <div className={'flex items-center justify-between gap-1'}>
                    <TT description={"Подтвердить сумму начислений"}>
                        <ConfirmEarningsBtn
                            userId={userInfo.user_id}
                            week={week}
                            active={userInfo.has_unconfirmed && !userInfo.is_closed}
                        />
                    </TT>


                    <div className={'flex-1 text-center border-x-2'}>
                        <TT
                            description={
                                `ЭЛО: ${formatNumber(userInfo.earned_sum)}, ДОП: ${formatNumber(userInfo.bonus_sum)}`
                            }
                        >
                            {formatNumber(userInfo.earned_sum + userInfo.bonus_sum, false)}
                        </TT>
                    </div>

                    <TT description={'Добавить ДОП начисление сотруднику'}>
                        <AddEarningBtn
                            disabled={!statusLessThen("3") || userInfo.is_closed}
                            week={week}
                            userId={userInfo.user_id}
                            earning_type={"ДОП"}
                        />
                    </TT>
                </div>
            </td>
            <td className="border border-gray-300 text-center w-[10em] relative">
                {(issuedInputValue && issuedInputValue !== userInfo.cash_payout) ? (
                    <DotFilledIcon
                        className={'absolute top-0 right-0 text-green-800 animate-pulse'}
                    />
                ) : null}

                <div className={'flex items-center justify-between gap-2'}>
                    <input
                        disabled={!statusLessThen("5") || userInfo.is_closed}
                        type="text"
                        className={'p-2 w-full outline-none border-none text-center h-full bg-yellow-100 disabled:bg-transparent'}
                        value={issuedInputValue?.toLocaleString('ru-RU')}
                        onChange={issuedChangeHandle}
                    />

                    <TT description={'Выдать сотруднику наличные ДС'}>
                        <AddEarningBtn
                            disabled={!statusLessThen("6") || userInfo.is_closed}
                            week={week}
                            userId={userInfo.user_id}
                            earning_type={"Выдача НАЛ"}
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
                                    Math.abs(userInfo.issued_sum) === userInfo.cash_payout ? 'bg-green-300' : 'bg-yellow-300',
                                    'h-full'
                                ])}/>
                        </div>
                        <div className={'absolute bottom-1 left-1 text-[0.7em] font-bold'}>
                            {Math.abs(userInfo.issued_sum).toLocaleString('ru-RU')}
                        </div>
                    </>
                )}
            </td>
            <td className="py-0 px-4 border border-gray-300">
                <div className={'flex items-center justify-between gap-2'}>
                    <div className={'flex-1 text-center border-r-2'}>
                        {formatNumber(userInfo.card_sum)}
                    </div>
                    <TT description={'Внести выдачу на карту или БН'}>
                        <AddEarningBtn
                            disabled={!statusLessThen("6") || userInfo.is_closed}
                            week={week}
                            userId={userInfo.user_id}
                            earning_type={"На карту"}
                        />
                    </TT>
                </div>
            </td>
            <td className="p-0 border border-gray-300">
                <div className={'flex items-center justify-between gap-2'}>
                    <div className={'flex-1 text-center border-r-2'}>
                        {formatNumber(userInfo.tax_sum)}
                    </div>
                    <TT description={'Добавить удержание налога и сборов'}>
                        <AddEarningBtn
                            disabled={!statusLessThen("6") || userInfo.is_closed}
                            week={week}
                            userId={userInfo.user_id}
                            earning_type={"Налог"}
                        />
                    </TT>
                </div>
            </td>
            <td className="border border-gray-300 relative">
                <div className={'flex items-center h-full text-[0.8em]'}>
                    <TextArea
                        disabled={!statusLessThen("6") || userInfo.is_closed}
                        className={'p-2 resize-none w-full bg-yellow-100 disabled:bg-transparent'}
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