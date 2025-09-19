import {useMemo} from "react";
import {Table} from "@/shared/ui/table/Table.tsx";
import {THead} from "@/shared/ui/table/THead.tsx";
import {useQuery} from "@tanstack/react-query";
import type {IWeek} from "@/shared/utils/date.ts";

import {payrollService} from "../../model/api.ts";

import {PayrollDepartmentInfo} from "./PayrollDepartmentInfo.tsx";
import {PayrollTh} from "./PayrollTh.tsx";
import {NiceNum} from "@/shared/ui/text/NiceNum.tsx";
import type {IPayrollRow} from "@/entities/salary";
import {useShowDayPrice} from "@/shared/state/payroll/showDayPrice.ts";
import {useShowEarnedDetail} from "@/shared/state/payroll/showEarnedDetail.ts";
import {useShowTotal} from "@/shared/state/payroll/showTotal.ts";
import {useHideSum} from "@/shared/state/payroll/hideSum.ts";


interface PayrollTableProps {
    currentWeek: IWeek;
    payrollId: number;
    state: "1" | "2" | "3" | "4" | "5" | "6";
}

export const PayrollTable = (props: PayrollTableProps) => {
    const {payrollId, state, currentWeek} = props;

    const showDayPrice = useShowDayPrice(s => s.showDayPrice);
    const showEarnedDetail = useShowEarnedDetail(s => s.showEarnedDetail);
    const showTotal = useShowTotal(s => s.showTotal);
    const hideSum = useHideSum(s => s.hideSum);

    const {data, isError, isFetching} = useQuery({
        queryKey: ['payrollRows', currentWeek.weekNumber],
        queryFn: () => {
            return payrollService.getPayrollRows({
                payroll_id: payrollId,
            });
        },
    });

    const groupedData = useMemo(() => {
        if (!data?.data) return {};
        return data.data.reduce((acc, row) => {
            if (!acc[row.department_name]) {
                acc[row.department_name] = [];
            }
            acc[row.department_name].push(row);
            acc[row.department_name].sort((a, b) => a.name.localeCompare(b.name));
            return acc;
        }, {} as Record<string, typeof data.data>);
    }, [data?.data]);

    if (isError) {
        return (<div>Ошибка...</div>)
    }

    if (isFetching) {
        return (<div>Загрузка...</div>)
    }

    const calculateTotal = (field: keyof IPayrollRow) =>
        data?.data?.reduce((sum, row) => Number(sum) + Number(row[field] || 0), 0) || 0;

    const totalBalance = calculateTotal('balance_sum');
    const totalCard = calculateTotal('card_sum');
    const totalEarned = calculateTotal('earned_sum');
    const totalBonus = calculateTotal('bonus_sum');
    const totalTax = calculateTotal('tax_sum');
    const totalIssued = calculateTotal('issued_sum');
    const totalLoan = calculateTotal('loan_sum');
    const totalIp = calculateTotal('ip_sum');
    const totalCashPayout = calculateTotal('cash_payout');
    const totalIpPayout = calculateTotal('ip_payout');
    const totalCardPayout = calculateTotal('card_payout');
    const totalTaxPayout = calculateTotal('tax_payout');
    const totalLoanPayout = calculateTotal('loan_payout');
    const totalDaySum = data?.data?.reduce((sum, row) => Number(sum) + Number(row.user.piecework_amount || 0), 0) || 0;

    const totalPayout = totalCashPayout + totalIpPayout + totalCardPayout + totalTaxPayout + totalLoanPayout;
    const blurStateClass = hideSum ? 'text-transparent group-hover:text-black' : '';

    return (
        <Table>
            <THead className={'sticky top-0 z-10 group'}>
                <tr className={'relative'}>
                    <PayrollTh
                        className={'text-center'}
                    >
                        Всего НАЛ ИП БН: <NiceNum
                        value={totalPayout - totalTaxPayout - totalLoanPayout}
                        className={blurStateClass}
                    />
                    </PayrollTh>
                    {showDayPrice && (
                        <PayrollTh>Ставка в <br/>день</PayrollTh>
                    )}
                    <PayrollTh>Хвост</PayrollTh>
                    {showEarnedDetail ? (
                        <>
                            <PayrollTh>ЭЛО</PayrollTh>
                            <PayrollTh>ДОП</PayrollTh>
                        </>
                    ) : (
                        <PayrollTh>Заработано</PayrollTh>
                    )}


                    {showTotal ? (
                        <PayrollTh className={'bg-blue-100'}>К выплате <br/> ИТОГ</PayrollTh>
                    ) : (
                        <>
                            <PayrollTh className={'bg-blue-100'}>К выплате <br/> НАЛ</PayrollTh>
                            <PayrollTh className={'bg-blue-100'}>К выплате <br/>ИП</PayrollTh>
                            <PayrollTh className={'bg-blue-100'}>К выплате <br/>БН</PayrollTh>
                            <PayrollTh className={'bg-blue-100'}>К выплате <br/>Налог</PayrollTh>
                            <PayrollTh className={'bg-blue-100'}>К выплате <br/>Займы</PayrollTh>
                        </>
                    )}
                    <PayrollTh className={'bg-blue-100'}>П.ИТОГ <br/>Хвоста</PayrollTh>

                    {showTotal ? (
                        <PayrollTh className={'bg-purple-50'}>Выплачено <br/> ИТОГ</PayrollTh>
                    ) : (
                        <>
                            <PayrollTh className={'bg-purple-50'}>НАЛ</PayrollTh>
                            <PayrollTh className={'bg-purple-50'}>ИП</PayrollTh>
                            <PayrollTh className={'bg-purple-50'}>БН</PayrollTh>
                            <PayrollTh className={'bg-purple-50'}>Налог</PayrollTh>
                            <PayrollTh className={'bg-purple-50'}>Займы</PayrollTh>
                        </>
                    )}

                    <PayrollTh className={'bg-purple-50'}>Остаток</PayrollTh>

                    <PayrollTh
                        rowSpan={2}
                        className={'text-center bg-purple-50'}
                    >
                        Комментарий
                    </PayrollTh>
                </tr>

                <tr className={'z-2'}>
                    <PayrollTh className={'text-center'}>Отдел / ФИО</PayrollTh>
                    {showDayPrice && (
                        <PayrollTh><NiceNum value={totalDaySum * 8}
                        className={blurStateClass}/></PayrollTh>
                    )}
                    <PayrollTh><NiceNum value={totalBalance}
                        className={blurStateClass}/></PayrollTh>
                    {showEarnedDetail ? (
                        <>
                            <PayrollTh><NiceNum value={totalEarned}
                        className={blurStateClass}/></PayrollTh>
                            <PayrollTh><NiceNum value={totalBonus}
                        className={blurStateClass}/></PayrollTh>
                        </>
                    ) : (
                        <PayrollTh><NiceNum value={totalEarned + totalBonus}
                        className={blurStateClass}/></PayrollTh>
                    )}

                    {showTotal ? (
                        <PayrollTh className={'bg-blue-100 font-bold'}>
                            <NiceNum value={totalPayout}
                        className={blurStateClass}/>
                        </PayrollTh>
                    ) : (
                        <>
                            <PayrollTh className={'bg-blue-100 font-bold'}>
                                <NiceNum value={totalCashPayout}
                        className={blurStateClass}/>
                            </PayrollTh>
                            <PayrollTh className={'bg-blue-100 font-bold'}>
                                <NiceNum value={totalIpPayout}
                        className={blurStateClass}/>
                            </PayrollTh>
                            <PayrollTh className={'bg-blue-100 font-bold'}>
                                <NiceNum value={totalCardPayout}
                        className={blurStateClass}/>
                            </PayrollTh>
                            <PayrollTh className={'bg-blue-100 font-bold'}>
                                <NiceNum value={totalTaxPayout}
                        className={blurStateClass}/>
                            </PayrollTh>
                            <PayrollTh className={'bg-blue-100 font-bold'}>
                                <NiceNum value={totalLoanPayout}
                        className={blurStateClass}/>
                            </PayrollTh>
                        </>
                    )}


                    <PayrollTh className={'bg-blue-100'}>
                        <NiceNum value={
                            totalBalance +
                            totalBonus +
                            totalEarned -
                            totalCashPayout -
                            totalCardPayout -
                            totalIpPayout -
                            totalTaxPayout -
                            totalLoanPayout
                        }
                        className={blurStateClass}/>
                    </PayrollTh>

                    {showTotal ? (
                        <PayrollTh className={'bg-purple-50 font-bold'}>
                            <NiceNum value={
                                totalIssued +
                                totalIp +
                                totalCard +
                                totalTax +
                                totalLoan
                            }
                        className={blurStateClass}/>
                        </PayrollTh>
                    ) : (
                        <>

                            <PayrollTh
                                className={'bg-purple-50 font-bold'}
                            >
                                <NiceNum value={totalIssued} abs
                        className={blurStateClass}/>
                            </PayrollTh>
                            <PayrollTh
                                className={'bg-purple-50 font-bold'}
                            >
                                <NiceNum value={totalIp} abs
                        className={blurStateClass}/>
                            </PayrollTh>
                            <PayrollTh
                                className={'bg-purple-50 font-bold'}
                            >
                                <NiceNum value={totalCard} abs
                        className={blurStateClass}/>
                            </PayrollTh>
                            <PayrollTh
                                className={'bg-purple-50 font-bold'}
                            >
                                <NiceNum value={totalTax} abs
                        className={blurStateClass}/>
                            </PayrollTh>
                            <PayrollTh
                                className={'bg-purple-50 font-bold'}
                            >
                                <NiceNum value={totalLoan} abs
                        className={blurStateClass}/>
                            </PayrollTh>
                        </>
                    )}


                    <PayrollTh
                        className={'bg-purple-50 font-bold'}
                    >
                        <NiceNum value={
                            totalCashPayout +
                            totalIpPayout +
                            totalCardPayout +
                            totalTaxPayout +
                            totalLoanPayout +
                            totalIssued +
                            totalIp +
                            totalCard +
                            totalTax +
                            totalLoan
                        }
                        className={blurStateClass}/>
                    </PayrollTh>
                </tr>
            </THead>

            <tbody>
            {groupedData && Object.entries(groupedData).map(([departmentName, earnings]) => (
                <PayrollDepartmentInfo
                    week={currentWeek}
                    departmentName={departmentName}
                    earnings={earnings}
                    key={departmentName}
                    state={state}
                />
            ))}
            </tbody>
        </Table>
    );
};
