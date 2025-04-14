import {useMemo} from "react";

import {WeekTransactions} from "@pages/StaffPage";
import {useEmployeeName} from "@shared/hooks";
import {useEmployeeList} from "@entities/Employee";


interface WagesInfoProps {
    startDate: string;
    endDate: string;
    employeeId: number;
}

export const WagesInfo = (props: WagesInfoProps) => {
    const {startDate, employeeId, endDate} = props;

    const {getNameById} = useEmployeeName();

    const {data, isLoading} = useEmployeeList({});

    const targetUser = useMemo(() => {
        return data?.find(user => user.id === employeeId);
    }, [data, employeeId])

    return (
        <div className={'p-3'}>
            <div>
                Детализация по заработной плате {getNameById(employeeId, 'listNameInitials')}
            </div>
            {targetUser && (
                <WeekTransactions
                    start_date={startDate.slice(0, 10)}
                    end_date={endDate.slice(0, 10)}
                    has_inspector={true}
                    isLoading={isLoading}
                    userInfo={undefined}
                    selectedEmployee={targetUser}
                />
            )}
        </div>
    )
};
