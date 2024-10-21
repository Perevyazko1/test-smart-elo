import {useMemo} from "react";
import {Table} from "react-bootstrap";

import {Employee} from "@entities/Employee";

import {StaffInfo, StaffInfoRange} from "../../../model/types";

import {StaffTableHead} from "./ui/StaffTableHead";
import {StaffTableRow} from "./ui/StaffTableRow";


interface StaffTableProps {
    ids: number[];
    isLoading: boolean;
    staffInfo: StaffInfo[] | undefined;
    userList: Employee[] | undefined;
    selectedEmployee: Employee | null;
    setSelectedEmployee: (option: Employee | null) => void;
    getUserInfo: (userId: number) => (StaffInfo | undefined);
}

export const StaffTable = (props: StaffTableProps) => {
    const {
        ids,
        selectedEmployee,
        setSelectedEmployee,
        userList,
        staffInfo,
        isLoading,
        getUserInfo,
    } = props;

    const totalDebitCredit = useMemo(() => {
        return userList?.reduce((sum, user) => sum + Number(user.current_balance), 0)
    }, [userList]);

    const getUserHeadInfo = useMemo(() => {
        if (staffInfo && staffInfo?.length > 0) {
            const summary: StaffInfoRange = JSON.parse(JSON.stringify(staffInfo[0].user_total_info));

            staffInfo.forEach(({user_total_info}, index) => {
                if (index !== 0) {
                    Object.entries(user_total_info).forEach(([key, value]) => {
                        summary[key as keyof StaffInfoRange].accrual += value.accrual;
                        summary[key as keyof StaffInfoRange].debit += value.debit;
                        summary[key as keyof StaffInfoRange].pre_accrual += value.pre_accrual;
                        summary[key as keyof StaffInfoRange].pre_debit += value.pre_debit;
                        if (!summary[key as keyof StaffInfoRange].no_confirmed) {
                            summary[key as keyof StaffInfoRange].no_confirmed = value.no_confirmed;
                        }
                    })
                }

            })
            return summary;
        }
        return null;
    }, [staffInfo]);

    return (
        <Table striped bordered hover size="sm"
               style={{
                   width: selectedEmployee ? "300px" : "100%",
                   maxWidth: "100%",
               }}
        >
            <StaffTableHead
                ids={ids}
                isLoading={isLoading}
                userHeadInfo={getUserHeadInfo}
                selectedEmployee={selectedEmployee}
                totalDebitCredit={totalDebitCredit}
                userCount={userList?.length}
            />

            <tbody>
            {userList?.map(employee => (
                <StaffTableRow
                    key={employee.id}
                    user={employee}
                    userInfo={getUserInfo(employee.id)}
                    selectedEmployee={selectedEmployee}
                    setSelectedEmployee={setSelectedEmployee}
                />
            ))}
            </tbody>
        </Table>
    );
};
