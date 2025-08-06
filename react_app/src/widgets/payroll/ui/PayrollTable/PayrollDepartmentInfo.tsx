import type {IPayrollRow} from "@/entities/salary";
import {PayrollUserInfo} from "@/widgets/payroll/ui/PayrollTable/PayrollUserInfo.tsx";
import {PayrollDepartment} from "./PayrollDepartment.tsx";
import type {IWeek} from "@/shared/utils/date.ts";
import {SALARY_STATUSES} from "@/shared/consts";

interface PayrollDepartmentInfoProps {
    week: IWeek;
    departmentName: string;
    earnings: IPayrollRow[];
    state: keyof typeof SALARY_STATUSES;
}

export const PayrollDepartmentInfo = (props: PayrollDepartmentInfoProps) => {
    const {departmentName, state, earnings,  week} = props;

    return (
        <>
            <PayrollDepartment>
                {departmentName}
            </PayrollDepartment>

            {earnings.map((earning) => (
                <PayrollUserInfo
                    state={state}
                    week={week}
                    key={earning.id}
                    userInfo={earning}
                />
            ))}
            <tr>
                <td><br/></td>
            </tr>
        </>
    );
};