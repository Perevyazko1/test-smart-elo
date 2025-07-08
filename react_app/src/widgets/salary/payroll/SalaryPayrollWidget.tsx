import {PayrollTh} from "@/widgets/salary/payroll/PayrollTable/PayrollTh.tsx";
import {PayrollDepartment} from "@/widgets/salary/payroll/PayrollTable/PayrollDepartment.tsx";
import {PayrollUserInfo} from "@/widgets/salary/payroll/PayrollTable/PayrollUserInfo.tsx";
import {testSalaryUserInfo} from "@/entities/salary/testData.ts";
import {THead} from "@/shared/ui/table/THead.tsx";
import {Table} from "@/shared/ui/table/Table.tsx";

interface SalaryPayrollWidgetProps {
    setSelectedUserId: (arg: number) => void;
}

export const SalaryPayrollWidget = (props: SalaryPayrollWidgetProps) => {
    const {setSelectedUserId} = props;

    return (
        <div className={'p-3 overflow-auto'}>
            <h1 className={"text-xl font-bold mb-4"}>
                Ведомость
            </h1>

            <Table>
                <THead>
                <tr>
                    <PayrollTh className={'w-1/4'}>Отдел / ФИО</PayrollTh>
                    <PayrollTh>Долг</PayrollTh>
                    <PayrollTh>Заработано</PayrollTh>
                    <PayrollTh>К выплате</PayrollTh>
                    <PayrollTh>На карту</PayrollTh>
                    <PayrollTh>Налог</PayrollTh>
                    <PayrollTh>Комментарий</PayrollTh>
                </tr>
                </THead>

                <tbody>
                <PayrollDepartment>
                    Обивка
                </PayrollDepartment>

                <PayrollUserInfo
                    userInfo={testSalaryUserInfo}
                    setSelectedUserId={setSelectedUserId}
                />
                <PayrollUserInfo
                    userInfo={testSalaryUserInfo}
                    setSelectedUserId={setSelectedUserId}
                />
                <PayrollUserInfo
                    userInfo={testSalaryUserInfo}
                    setSelectedUserId={setSelectedUserId}
                />
                <PayrollUserInfo
                    userInfo={testSalaryUserInfo}
                    setSelectedUserId={setSelectedUserId}
                />
                <PayrollUserInfo
                    userInfo={testSalaryUserInfo}
                    setSelectedUserId={setSelectedUserId}
                />
                <PayrollUserInfo
                    userInfo={testSalaryUserInfo}
                    setSelectedUserId={setSelectedUserId}
                />
                <tr>
                    <td><br/></td>
                </tr>


                <PayrollDepartment>
                    Крой
                </PayrollDepartment>
                <PayrollUserInfo
                    userInfo={testSalaryUserInfo}
                    setSelectedUserId={setSelectedUserId}
                />
                <PayrollUserInfo
                    userInfo={testSalaryUserInfo}
                    setSelectedUserId={setSelectedUserId}
                />
                <PayrollUserInfo
                    userInfo={testSalaryUserInfo}
                    setSelectedUserId={setSelectedUserId}
                />
                <tr>
                    <td><br/></td>
                </tr>


                <PayrollDepartment>
                    Пошив
                </PayrollDepartment>
                <PayrollUserInfo
                    userInfo={testSalaryUserInfo}
                    setSelectedUserId={setSelectedUserId}
                />
                <PayrollUserInfo
                    userInfo={testSalaryUserInfo}
                    setSelectedUserId={setSelectedUserId}
                />
                <PayrollUserInfo
                    userInfo={testSalaryUserInfo}
                    setSelectedUserId={setSelectedUserId}
                />
                <tr>
                    <td><br/></td>
                </tr>

                </tbody>
            </Table>
        </div>
    );
};