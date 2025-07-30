import {memo, useMemo} from "react";
import {Table} from "@/shared/ui/table/Table.tsx";
import {THead} from "@/shared/ui/table/THead.tsx";
import {useQuery} from "@tanstack/react-query";
import type {IWeek} from "@/shared/utils/date.ts";

import {payrollService} from "../../model/api.ts";

import {PayrollDepartmentInfo} from "./PayrollDepartmentInfo.tsx";
import {PayrollTh} from "./PayrollTh.tsx";


interface PayrollTableProps {
    currentWeek: IWeek;
    payrollId: number;
    state: "1" | "2" | "3" | "4" | "5" | "6";
    setSelectedUserId: (arg: number) => void;
}

export const PayrollTable = memo((props: PayrollTableProps) => {
    const {payrollId, state, currentWeek, setSelectedUserId} = props;

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

    const totalBalance = data?.data?.reduce((sum, row) => sum + row.balance_sum, 0) || 0;
    const totalCard = data?.data?.reduce((sum, row) => sum + row.card_sum, 0) || 0;
    const totalEarned = data?.data?.reduce((sum, row) => sum + row.earned_sum, 0) || 0;
    const totalBonus = data?.data?.reduce((sum, row) => sum + row.bonus_sum, 0) || 0;
    const totalTax = data?.data?.reduce((sum, row) => sum + row.tax_sum, 0) || 0;
    const totalPayout = data?.data?.reduce((sum, row) => sum + row.cash_payout, 0) || 0;
    const totalIssued = data?.data?.reduce((sum, row) => sum + row.issued_sum, 0) || 0;
    const totalLoan = data?.data?.reduce((sum, row) => sum + row.loan_sum, 0) || 0;

    return (
        <Table>
            <THead>
                <tr>
                    <PayrollTh
                        rowSpan={2}
                        className={'w-1/4 text-center'}
                    >
                        Отдел / ФИО
                    </PayrollTh>
                    <PayrollTh>Хвост</PayrollTh>
                    <PayrollTh>Заработано</PayrollTh>
                    <PayrollTh>К выплате</PayrollTh>
                    <PayrollTh>НАЛ</PayrollTh>
                    <PayrollTh>БН</PayrollTh>
                    <PayrollTh>Налог</PayrollTh>
                    <PayrollTh>Займы</PayrollTh>
                    <PayrollTh
                        rowSpan={2}
                        className={'text-center'}
                    >
                        Комментарий
                    </PayrollTh>
                </tr>
                <tr>
                    <PayrollTh>{totalBalance.toLocaleString('ru-RU')}</PayrollTh>
                    <PayrollTh>{(totalEarned + totalBonus).toLocaleString('ru-RU')}</PayrollTh>
                    <PayrollTh>{totalPayout.toLocaleString('ru-RU')}</PayrollTh>
                    <PayrollTh>{Math.abs(totalIssued).toLocaleString('ru-RU')}</PayrollTh>
                    <PayrollTh>{Math.abs(totalCard).toLocaleString('ru-RU')}</PayrollTh>
                    <PayrollTh>{Math.abs(totalTax).toLocaleString('ru-RU')}</PayrollTh>
                    <PayrollTh>{Math.abs(totalLoan).toLocaleString('ru-RU')}</PayrollTh>
                </tr>
                <tr>
                    <th colSpan={7}><br/></th>
                </tr>
            </THead>

            <tbody>
            {groupedData && Object.entries(groupedData).map(([departmentName, earnings]) => (
                <PayrollDepartmentInfo
                    week={currentWeek}
                    setSelectedUserId={setSelectedUserId}
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
