import {useMemo} from "react";

import type {IPayroll} from "@/entities/salary";
import {Table} from "@/shared/ui/table/Table.tsx";
import {THead} from "@/shared/ui/table/THead.tsx";
import {useQuery} from "@tanstack/react-query";
import type {IWeek} from "@/shared/utils/date.ts";

import { payrollService } from "../../model/api.ts";

import {PayrollDepartmentInfo} from "./PayrollDepartmentInfo.tsx";
import {PayrollTh} from "./PayrollTh.tsx";


interface PayrollTableProps {
    currentWeek: IWeek;
    payroll?: IPayroll | null;
    setSelectedUserId: (arg: number) => void;
}

export const PayrollTable = (props: PayrollTableProps) => {
    const {payroll, currentWeek, setSelectedUserId} = props;

    const {data, isError, isFetching} = useQuery({
        queryKey: ['payrollRows', currentWeek.weekNumber],
        queryFn: () => {
            return payrollService.getPayrollRows({
                payroll_id: payroll!.id,
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

    const totalBalance = data?.data?.reduce((sum, row) => sum + row.start_balance, 0) || 0;
    const totalCard = data?.data?.reduce((sum, row) => sum + row.card_sum, 0) || 0;
    const totalEarned = data?.data?.reduce((sum, row) => sum + row.earned_sum, 0) || 0;
    const totalBonus = data?.data?.reduce((sum, row) => sum + row.bonus_sum, 0) || 0;
    const totalTax = data?.data?.reduce((sum, row) => sum + row.tax_sum, 0) || 0;
    const totalCash = data?.data?.reduce((sum, row) => sum + row.cash_payout, 0) || 0;

    if (!payroll) {
        return (
            <div>----</div>
        )
    }

    return (
        <Table>
            <THead>
                <tr>
                    <PayrollTh
                        rowSpan={2}
                        className={'w-1/4'}
                    >
                        Отдел / ФИО
                    </PayrollTh>
                    <PayrollTh>Долг</PayrollTh>
                    <PayrollTh>Заработано</PayrollTh>
                    <PayrollTh>К выплате</PayrollTh>
                    <PayrollTh>На карту</PayrollTh>
                    <PayrollTh>Налог</PayrollTh>
                    <PayrollTh
                        rowSpan={2}
                    >
                        Комментарий
                    </PayrollTh>
                </tr>
                <tr>
                    <PayrollTh>{totalBalance.toLocaleString('ru-RU')}</PayrollTh>
                    <PayrollTh>{(totalEarned + totalBonus).toLocaleString('ru-RU')}</PayrollTh>
                    <PayrollTh>{totalCash.toLocaleString('ru-RU')}</PayrollTh>
                    <PayrollTh>{Math.abs(totalCard).toLocaleString('ru-RU')}</PayrollTh>
                    <PayrollTh>{Math.abs(totalTax).toLocaleString('ru-RU')}</PayrollTh>
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
                    state={payroll.state}
                />
            ))}
            </tbody>
        </Table>
    );
};
