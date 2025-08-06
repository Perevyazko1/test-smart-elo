import {memo, useMemo} from "react";
import {Table} from "@/shared/ui/table/Table.tsx";
import {THead} from "@/shared/ui/table/THead.tsx";
import {useQuery} from "@tanstack/react-query";
import type {IWeek} from "@/shared/utils/date.ts";

import {payrollService} from "../../model/api.ts";

import {PayrollDepartmentInfo} from "./PayrollDepartmentInfo.tsx";
import {PayrollTh} from "./PayrollTh.tsx";
import {formatNumber} from "@/shared/utils/formatNumber.ts";
import {NiceNum} from "@/shared/ui/text/NiceNum.tsx";
import type {IPayrollRow} from "@/entities/salary";


interface PayrollTableProps {
    currentWeek: IWeek;
    payrollId: number;
    state: "1" | "2" | "3" | "4" | "5" | "6";
}

export const PayrollTable = memo((props: PayrollTableProps) => {
    const {payrollId, state, currentWeek} = props;

    const {data, isError, isFetching} = useQuery({
        queryKey: ['payrollRows', currentWeek.weekNumber],
        queryFn: () => {
            return payrollService.getPayrollRows({
                payroll_id: payrollId,
            });
        },
        staleTime: Infinity,
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

    return (
        <Table>
            <THead>
            <tr>
                    <PayrollTh
                        rowSpan={2}
                        className={'text-center'}
                    >
                        Отдел / ФИО
                    </PayrollTh>
                    <PayrollTh>Хвост</PayrollTh>
                    <PayrollTh>Заработано</PayrollTh>

                    <PayrollTh className={'bg-blue-100'}>К выплате <br/> НАЛ</PayrollTh>
                    <PayrollTh className={'bg-blue-100'}>К выплате <br/>ИП</PayrollTh>
                    <PayrollTh className={'bg-blue-100'}>К выплате <br/>БН</PayrollTh>
                    <PayrollTh className={'bg-blue-100'}>К выплате <br/>Налог</PayrollTh>
                    <PayrollTh className={'bg-blue-100'}>К выплате <br/>Займы</PayrollTh>

                    <PayrollTh className={'bg-purple-50'}>НАЛ</PayrollTh>
                    <PayrollTh className={'bg-purple-50'}>ИП</PayrollTh>
                    <PayrollTh className={'bg-purple-50'}>БН</PayrollTh>
                    <PayrollTh className={'bg-purple-50'}>Налог</PayrollTh>
                    <PayrollTh className={'bg-purple-50'}>Займы</PayrollTh>

                    <PayrollTh className={'bg-purple-50'}>Остаток</PayrollTh>

                    <PayrollTh
                        rowSpan={2}
                        className={'text-center bg-purple-50'}
                    >
                        Комментарий
                    </PayrollTh>
                </tr>
                <tr>
                    <PayrollTh><NiceNum value={totalBalance}/></PayrollTh>
                    <PayrollTh><NiceNum value={totalEarned + totalBonus}/></PayrollTh>

                    <PayrollTh className={'bg-blue-100 font-bold'}>
                        <NiceNum value={totalCashPayout}/></PayrollTh>
                    <PayrollTh className={'bg-blue-100 font-bold'}>
                        <NiceNum value={totalIpPayout}/></PayrollTh>
                    <PayrollTh className={'bg-blue-100 font-bold'}>
                        <NiceNum value={totalCardPayout}/></PayrollTh>
                    <PayrollTh className={'bg-blue-100 font-bold'}>
                        <NiceNum value={totalTaxPayout}/></PayrollTh>
                    <PayrollTh className={'bg-blue-100 font-bold'}>
                        <NiceNum value={totalLoanPayout}/></PayrollTh>

                    <PayrollTh
                        className={'bg-purple-50 font-bold'}
                    >
                        <NiceNum value={totalIssued} abs/>
                    </PayrollTh>
                    <PayrollTh
                        className={'bg-purple-50 font-bold'}
                    >
                        <NiceNum value={totalIp} abs/>
                    </PayrollTh>
                    <PayrollTh
                        className={'bg-purple-50 font-bold'}
                    >
                        <NiceNum value={totalCard} abs/>
                    </PayrollTh>
                    <PayrollTh
                        className={'bg-purple-50 font-bold'}
                    >
                        <NiceNum value={totalTax} abs/>
                    </PayrollTh>
                    <PayrollTh
                        className={'bg-purple-50 font-bold'}
                    >
                        <NiceNum value={totalLoan} abs/>
                    </PayrollTh>

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
                        }/>
                    </PayrollTh>
                </tr>
                <tr>
                    <th colSpan={10}><br/></th>
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
});
