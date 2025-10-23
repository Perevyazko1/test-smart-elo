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
import {useShowDayPrice} from "@/shared/state/payroll/showDayPrice.ts";
import {useShowEarnedDetail} from "@/shared/state/payroll/showEarnedDetail.ts";
import {useShowTotal} from "@/shared/state/payroll/showTotal.ts";
import {useHideSum} from "@/shared/state/payroll/hideSum.ts";


interface PayrollUserInfoProps {
    userInfo: IPayrollRow;
    week: IWeek;
    state: keyof typeof SALARY_STATUSES;
}

export const PayrollUserInfo = (props: PayrollUserInfoProps) => {
    const {userInfo, state, week} = props;
    const queryClient = useQueryClient();

    const showDayPrice = useShowDayPrice(s => s.showDayPrice);
    const showEarnedDetail = useShowEarnedDetail(s => s.showEarnedDetail);
    const showTotal = useShowTotal(s => s.showTotal);
    const hideSum = useHideSum(s => s.hideSum);

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

    const prevTotal =
        (userInfo.balance_sum || 0) +
        (userInfo.earned_sum || 0) +
        (userInfo.bonus_sum || 0) -
        (userInfo.cash_payout || 0) -
        (userInfo.ip_payout || 0) -
        (userInfo.card_payout || 0) -
        (userInfo.tax_payout || 0) -
        (userInfo.loan_payout || 0)

    const blurStateClass = hideSum ? 'text-transparent group-hover:text-black' : '';

    return (
        <tr
            id={`payrollRow${userInfo.user.id}`}
            className={
                twMerge(
                    'transition-all duration-100 ease-in-out',
                    'hover:outline-2 hover:outline-green-600 hover:-outline-offset-2 hover:bg-amber-100',
                    'group',
                    userInfo.is_closed ? 'bg-green-50' :
                        userInfo.is_locked ? 'bg-pink-50' : '',
                )
            }
        >
            <FormProvider {...methods}>
                {/*Имя*/}
                <UserNameCell
                    mutateClb={mutate}
                    isPending={isPending}
                    userInfo={userInfo}
                    week={week}
                />

                {/*Стоимость дня*/}
                {showDayPrice && (
                    <td className={twMerge(
                        "text-end"
                    )}>
                        <TT description={`Ставка в день.`}>
                            <NiceNum value={
                                userInfo.user.piecework_amount ?
                                    userInfo.user.piecework_amount * 8
                                    : null
                            } className={blurStateClass}/>
                        </TT>
                    </td>
                )}

                {/*Баланс на начало недели*/}
                <td className={twMerge(
                    "text-end"
                )}>
                    <TT description={`Баланс на начало ${week.weekNumber} нед.`}>
                        <NiceNum
                            className={blurStateClass}
                            value={userInfo.hide_balance ? null : userInfo.balance_sum}
                        />
                    </TT>
                </td>

                {/*Отдельно Заработано ЭЛО*/}
                {showEarnedDetail && (
                    <td className={twMerge(
                        "text-end"
                    )}>
                        <TT description={`Заработано ЭЛО сделка`}>
                            <NiceNum
                                className={blurStateClass}
                                value={userInfo.earned_sum}
                            />
                        </TT>
                    </td>
                )}

                {/*Начислено ДОП и задачи*/}
                <UserAddCell
                    value={
                        showEarnedDetail ?
                            userInfo.bonus_sum
                            :
                            (userInfo.earned_sum || 0) + (userInfo.bonus_sum || 0)
                    }
                    info={
                        !statusLessThen("3") ? "Блок - статус ведомости" :
                            userInfo.is_closed ? "Блок - расчеты с сотр. завершены" :
                                "Добавить ДОП начисление сотруднику"
                    }
                    valueInfo={showEarnedDetail ?
                        "Начислено ДОП и задачи"
                        :
                        `ЭЛО: ${formatNumber(userInfo.earned_sum)}, ДОП: ${formatNumber(userInfo.bonus_sum)}`
                    }
                    disabled={!statusLessThen("3") || userInfo.is_closed}
                    user={userInfo.user}
                    week={week}
                    earning_type={"ДОП"}
                    about={`ЗП Нед ${week.weekNumber}`}
                    className={twMerge(
                        blurStateClass,
                    )}
                    textClassName={blurStateClass}
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

                {/*Итого к выдаче*/}
                {showTotal ? (
                    <td
                        className={twMerge(
                            "text-end bg-blue-100"
                        )}
                    >
                        <TT description={`Итого к выдаче`}>
                            <NiceNum
                                value={
                                    (userInfo.earned_sum || 0) +
                                    (userInfo.ip_payout || 0) +
                                    (userInfo.card_payout || 0) +
                                    (userInfo.tax_payout || 0) +
                                    (userInfo.loan_payout || 0)
                                }
                                className={twMerge(
                                    blurStateClass,
                                )}
                            />
                        </TT>
                    </td>
                ) : (
                    <>
                        {/*К выдаче НАЛ*/}
                        <UserCashCell
                            name={"cash_payout"}
                            info={"Сумма к выдаче наличными"}
                            isLoading={methods.watch("cash_payout") !== userInfo.cash_payout}
                            disabled={!statusLessThen("5") || userInfo.is_locked}
                            className={twMerge(
                                blurStateClass,
                            )}
                        />
                        {/*К выдаче ИП*/}
                        <UserCashCell
                            name={"ip_payout"}
                            info={"Сумма к выдаче через ИП"}
                            isLoading={methods.watch("ip_payout") !== userInfo.ip_payout}
                            disabled={!statusLessThen("5") || userInfo.is_locked}
                            className={twMerge(
                                blurStateClass,
                            )}
                        />
                        {/*К выдаче ОФИЦИАЛКА*/}
                        <UserCashCell
                            name={"card_payout"}
                            info={"Сумма к выдаче официалка"}
                            isLoading={methods.watch("card_payout") !== userInfo.card_payout}
                            disabled={!statusLessThen("5") || userInfo.is_locked}
                            className={twMerge(
                                blurStateClass,
                            )}
                        />
                        {/*К выдаче НДФЛ*/}
                        <UserCashCell
                            name={"tax_payout"}
                            info={"Сумма к удержанию НДФЛ"}
                            isLoading={methods.watch("tax_payout") !== userInfo.tax_payout}
                            disabled={!statusLessThen("5") || userInfo.is_locked}
                            className={twMerge(
                                blurStateClass,
                            )}
                        />
                        {/*К выдаче ЗАЙМ*/}
                        <UserCashCell
                            name={"loan_payout"}
                            info={"Сумма к удержанию в займы"}
                            isLoading={methods.watch("loan_payout") !== userInfo.loan_payout}
                            disabled={!statusLessThen("5") || userInfo.is_locked}
                            className={twMerge(
                                blurStateClass,
                            )}
                        />
                    </>
                )}

                {/*Хвосты подытог после выдачи*/}
                <td className={twMerge(
                    "text-end bg-blue-100",
                    userInfo.hide_balance ? "text-blue-100" : "text-black",
                    blurStateClass,
                )}>
                    <TT description={`Подытог после проведения расчета ${formatNumber(prevTotal, false)}`}>
                        <NiceNum
                            className={
                                twMerge(
                                    userInfo.hide_balance ? "text-transparent" : '',
                                    blurStateClass
                                )
                            }
                            value={userInfo.hide_balance ? null : prevTotal}
                        />
                    </TT>
                </td>

                {/*Итого выдано*/}
                {showTotal ? (
                    <td className={twMerge(
                        "text-end bg-purple-50",
                        blurStateClass,
                    )}>
                        <TT description={`Итого выдано`}>
                            <NiceNum value={
                                (userInfo.issued_sum || 0) +
                                (userInfo.ip_sum || 0) +
                                (userInfo.card_sum || 0) +
                                (userInfo.tax_sum || 0) +
                                (userInfo.loan_sum || 0)
                            }
                                     className={twMerge(
                                         blurStateClass,
                                     )}
                            />
                        </TT>
                    </td>
                ) : (
                    <>
                        {/*Выдано НАЛ*/}
                        <UserAddCell
                            className={twMerge(
                                'bg-purple-50',
                            )}
                            textClassName={blurStateClass}
                            value={userInfo.issued_sum}
                            amount={(userInfo.issued_sum || 0) + (userInfo.cash_payout || 0)}
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

                        {/*Выдано ИП*/}
                        <UserAddCell
                            className={twMerge(
                                'bg-purple-50',
                            )}
                            textClassName={blurStateClass}
                            value={userInfo.ip_sum}
                            amount={(userInfo.ip_sum || 0) + (userInfo.ip_payout || 0)}
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

                        {/*Выдано ОФИЦИАЛКА*/}
                        <UserAddCell
                            className={twMerge(
                                'bg-purple-50',
                            )}
                            textClassName={blurStateClass}
                            value={userInfo.card_sum}
                            amount={(userInfo.card_sum || 0) + (userInfo.card_payout || 0)}
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

                        {/*Выдано НДФЛ*/}
                        <UserAddCell
                            className={twMerge(
                                'bg-purple-50',
                            )}
                            textClassName={blurStateClass}
                            value={userInfo.tax_sum}
                            amount={(userInfo.tax_sum || 0) + (userInfo.tax_payout || 0)}
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

                        {/*Выдано ЗАЙМ*/}
                        <UserLoanCell
                            textClassName={blurStateClass}
                            className={twMerge(
                                'bg-purple-50',
                            )}
                            amount={(userInfo.loan_sum || 0) + (userInfo.loan_payout || 0)}
                            disabled={!statusLessThen("4") || userInfo.is_closed}
                            week={week}
                            userInfo={userInfo}
                        />
                    </>
                )}

                {/*Остаток к выплате*/}
                <td className={twMerge(
                    "text-end bg-purple-50 font-bold",
                    blurStateClass,
                )}>
                    <TT description={`Остаток к выплате`}>
                        <NiceNum
                            className={
                                twMerge(
                                    totalValue === 0 ? "opacity-20" : "",
                                    blurStateClass,
                                )
                            }
                            value={
                                totalValue
                            }/>
                    </TT>
                </td>

                {/*Комментарий*/}
                <td className="relative bg-purple-50 px-2">
                    <div className={'flex items-center min-h-full text-[0.8em]'}>
                        <TextAreaForm
                            name="comment"
                            className={
                                twMerge(
                                    blurStateClass,
                                    'w-full bg-yellow-50 min-h-full disabled:bg-transparent'
                                )
                            }
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
