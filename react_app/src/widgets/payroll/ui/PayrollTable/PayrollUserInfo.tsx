import type {IPayrollRow} from "@/entities/salary";
import type {IWeek} from "@/shared/utils/date.ts";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {useEffect} from "react";
import {useDebounce} from "@/shared/utils/useDebounce.tsx";
import {DotFilledIcon} from "@radix-ui/react-icons";
import {twMerge} from "tailwind-merge";
import type {AxiosResponse} from "axios";
import {type IUpdatePayrollRow, payrollService} from "../../model/api.ts";
import {SALARY_STATUSES} from "@/shared/consts";
import {formatNumber} from "@/shared/utils/formatNumber.ts";
import {UserCashCell} from "@/widgets/payroll/ui/PayrollCells/UserCashCell.tsx";
import {UserAddCell} from "@/widgets/payroll/ui/PayrollCells/UserAddCell.tsx";
import {UserLoanCell} from "@/widgets/payroll/ui/PayrollCells/UserLoanCell.tsx";
import {UserNameCell} from "@/widgets/payroll/ui/PayrollCells/UserNameCell.tsx";
import {TT} from "@/shared/ui/tooltip/TT.tsx";
import {NiceNum} from "@/shared/ui/text/NiceNum.tsx";
import {ConfirmEarningsBtn} from "@/widgets/salary/accrual/ConfirmEarningsBtn.tsx";
import {FormProvider, useForm, useWatch} from "react-hook-form";
import {TextAreaForm} from "@/shared/ui/inputs/TextInputForm.tsx";


interface PayrollUserInfoProps {
    userInfo: IPayrollRow;
    week: IWeek;
    state: keyof typeof SALARY_STATUSES;
}

export const PayrollUserInfo = (props: PayrollUserInfoProps) => {
    const {userInfo, state, week} = props;
    const queryClient = useQueryClient();

    const debouncedUpdateRow = useDebounce(
        (data: {
            cash_payout?: number;
            comment?: string;
        }) => mutate({
            id: userInfo.id,
            ...data
        }),
        500
    );

    const methods = useForm<Partial<IUpdatePayrollRow>>({
        defaultValues: {
            cash_payout: userInfo.cash_payout,
            ip_payout: userInfo.ip_payout,
            card_payout: userInfo.card_payout,
            tax_payout: userInfo.tax_payout,
            loan_payout: userInfo.loan_payout,
            comment: userInfo.comment,
        }
    });

    const watchedFields = useWatch({
        control: methods.control,
        name: ["cash_payout", "ip_payout", "card_payout", "tax_payout", "loan_payout", "comment"]
    });

    useEffect(() => {
        const [cash_payout, ip_payout, card_payout, tax_payout, loan_payout, comment] = watchedFields;

        if (cash_payout !== userInfo.cash_payout) {
            debouncedUpdateRow({cash_payout});
        }
        if (ip_payout !== userInfo.ip_payout) {
            debouncedUpdateRow({ip_payout});
        }
        if (card_payout !== userInfo.card_payout) {
            debouncedUpdateRow({card_payout});
        }
        if (tax_payout !== userInfo.tax_payout) {
            debouncedUpdateRow({tax_payout});
        }
        if (loan_payout !== userInfo.loan_payout) {
            debouncedUpdateRow({loan_payout});
        }
        if (comment !== userInfo.comment) {
            debouncedUpdateRow({comment});
        }
    }, [watchedFields]);


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

    const statusLessThen = (status: keyof typeof SALARY_STATUSES) => {
        return Number(state) < Number(status);
    }

    const totalValue = (userInfo.cash_payout || 0) +
        (userInfo.ip_payout || 0) +
        (userInfo.card_payout || 0) +
        (userInfo.tax_payout || 0) +
        (userInfo.loan_payout || 0) +
        (userInfo.issued_sum || 0) +
        (userInfo.ip_sum || 0) +
        (userInfo.card_sum || 0) +
        (userInfo.tax_sum || 0) +
        (userInfo.loan_sum || 0)

    return (
        <tr
            id={`payrollRow${userInfo.user.id}`}
            className={
                twMerge(
                    'transition-all duration-300 ease-in-out',
                    userInfo.is_closed ? 'bg-green-50' : '',
                )
            }
        >
            <FormProvider {...methods}>

                <UserNameCell
                    mutateClb={mutate}
                    isPending={isPending}
                    userInfo={userInfo}
                    week={week}
                />


                <td className="text-end">
                    <TT description={`Баланс на начало ${week.weekNumber} нед.`}>
                        <NiceNum value={userInfo.hide_balance ? null : userInfo.balance_sum}/>
                    </TT>
                </td>

                <UserAddCell
                    value={(userInfo.earned_sum || 0) + (userInfo.bonus_sum || 0)}
                    info={
                        !statusLessThen("3") ? "Блок - статус ведомости" :
                            userInfo.is_closed ? "Блок - расчеты с сотр. завершены" :
                                "Добавить ДОП начисление сотруднику"
                    }
                    valueInfo={`ЭЛО: ${formatNumber(userInfo.earned_sum)}, ДОП: ${formatNumber(userInfo.bonus_sum)}`}
                    disabled={!statusLessThen("3") || userInfo.is_closed}
                    user={userInfo.user}
                    week={week}
                    earning_type={"ДОП"}
                    about={`ЗП Нед ${week.weekNumber}`}
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
                    name={"cash_payout"}
                    info={"Сумма к выдаче наличными"}
                    isLoading={methods.watch("cash_payout") !== userInfo.cash_payout}
                    disabled={!statusLessThen("5") || userInfo.is_locked}
                />
                <UserCashCell
                    name={"ip_payout"}
                    info={"Сумма к выдаче через ИП"}
                    isLoading={methods.watch("ip_payout") !== userInfo.ip_payout}
                    disabled={!statusLessThen("5") || userInfo.is_locked}
                />
                <UserCashCell
                    name={"card_payout"}
                    info={"Сумма к выдаче официалка"}
                    isLoading={methods.watch("card_payout") !== userInfo.card_payout}
                    disabled={!statusLessThen("5") || userInfo.is_locked}
                />
                <UserCashCell
                    name={"tax_payout"}
                    info={"Сумма к удержанию НДФЛ"}
                    isLoading={methods.watch("tax_payout") !== userInfo.tax_payout}
                    disabled={!statusLessThen("5") || userInfo.is_locked}
                />
                <UserCashCell
                    name={"loan_payout"}
                    info={"Сумма к удержанию в займы"}
                    isLoading={methods.watch("loan_payout") !== userInfo.loan_payout}
                    disabled={!statusLessThen("5") || userInfo.is_locked}
                />

                <UserAddCell
                    className={'bg-purple-50'}
                    value={userInfo.issued_sum}
                    info={
                        !statusLessThen("6") ? "Блок - статус ведомости" :
                            userInfo.is_closed ? "Блок - расчеты с сотр. завершены" :
                                "Выдать сотруднику наличные ДС"
                    }
                    valueInfo={'Выдано наличными'}
                    disabled={!statusLessThen("6") || userInfo.is_closed}
                    user={userInfo.user}
                    week={week}
                    earning_type={"Выдача НАЛ"}
                    about={`Выдача НАЛ ЗП нед ${week.weekNumber}`}
                />

                <UserAddCell
                    className={'bg-purple-50'}
                    value={userInfo.ip_sum}
                    info={
                        !statusLessThen("6") ? "Блок - статус ведомости" :
                            userInfo.is_closed ? "Блок - расчеты с сотр. завершены" :
                                "Выдать сотруднику через средства ИП"
                    }
                    valueInfo={'Выдача на ИП сотрудника'}
                    disabled={!statusLessThen("6") || userInfo.is_closed}
                    user={userInfo.user}
                    week={week}
                    earning_type={"ИП"}
                    about={`Выдача на ИП ЗП нед ${week.weekNumber}`}
                />

                <UserAddCell
                    className={'bg-purple-50'}
                    value={userInfo.card_sum}
                    info={
                        !statusLessThen("6") ? "Блок - статус ведомости" :
                            userInfo.is_closed ? "Блок - расчеты с сотр. завершены" :
                                "Внести выдачу на карту или БН"
                    }
                    valueInfo={'Выдано на карту или по безналу'}
                    disabled={!statusLessThen("6") || userInfo.is_closed}
                    user={userInfo.user}
                    week={week}
                    earning_type={"На карту"}
                    about={`Выдача безнал ЗП нед ${week.weekNumber}`}
                />

                <UserAddCell
                    className={'bg-purple-50'}
                    value={userInfo.tax_sum}
                    info={
                        !statusLessThen("6") ? "Блок - статус ведомости" :
                            userInfo.is_closed ? "Блок - расчеты с сотр. завершены" :
                                "Добавить удержание налога и сборов"
                    }
                    valueInfo={'Удержано налога (НДФЛ и пр)'}
                    disabled={!statusLessThen("6") || userInfo.is_closed}
                    user={userInfo.user}
                    week={week}
                    earning_type={"Налог"}
                    about={`Удержанный налог в ${week.weekNumber} неделе`}
                />

                <UserLoanCell
                    className={'bg-purple-50'}
                    disabled={!statusLessThen("4") || userInfo.is_closed}
                    week={week}
                    userInfo={userInfo}
                />

                <td className={twMerge(
                    "text-end bg-purple-50 font-bold",
                )}>
                    <TT description={`Остаток к выплате`}>
                        <NiceNum
                            className={totalValue === 0 ? "opacity-20" : ""}
                            value={
                                totalValue
                            }/>
                    </TT>
                </td>

                <td className="relative bg-purple-50 px-2">
                    <div className={'flex items-center min-h-full text-[0.8em]'}>
                        <TextAreaForm
                            name="comment"
                            className={'w-full bg-yellow-50 min-h-full disabled:bg-transparent'}
                            disabled={!statusLessThen("6") || userInfo.is_locked}
                        />
                    </div>
                    {methods.watch("comment") !== userInfo.comment && (
                        <DotFilledIcon
                            className={'absolute top-0 right-0 text-green-800 animate-pulse'}
                        />
                    )}
                </td>
            </FormProvider>
        </tr>
    );
};
