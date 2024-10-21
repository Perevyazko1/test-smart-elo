import {useCallback, useEffect, useMemo, useState} from "react";

import {Employee, useEmployeeList} from "@entities/Employee";
import {useAppQuery} from "@shared/hooks";

import {GetStaffInfo} from "../../model/api/api";

import {StaffDetails} from "./StaffDetails/StaffDetails";
import {StaffTable} from "./StaffTable/StaffTable";


export const StaffPageBody = () => {
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const {queryParameters} = useAppQuery();

    const {
        data: userList,
        isLoading: userListIsLoading,
        isFetching: userListIsFetching
    } = useEmployeeList({
        user_departments_only: true,
        ordering: 'permanent_department',
        ...(queryParameters.permanent_department__id &&
            {permanent_department__id: [queryParameters.permanent_department__id]}
        ),
        ...(queryParameters.piecework_wages &&
            {piecework_wages: [queryParameters.piecework_wages]}
        ),
        ...(queryParameters.find &&
            {find: [queryParameters.find]}
        ),
        ...(!queryParameters.is_active &&
            {is_active: true}
        ),
    });

    const iDs = useMemo(() => {
        const result = userList?.map(item => item.id)
        if (result && result.length > 0) {
            return result;
        }
        return null;
    }, [userList]);

    const {data: staffInfo, isFetching: infoIsFetching, isLoading: infoIsLoading} = GetStaffInfo({
        ids: iDs,
        ordering: 'permanent_department',
        start_date: queryParameters.start_date,
        end_date: queryParameters.end_date,
        ...(!!queryParameters.wages_only &&
            {wages_only: true}
        ),
        ...(!!queryParameters.by_target_date &&
            {by_target_date: queryParameters.by_target_date}
        ),
    }, {
        skip: userListIsLoading || userListIsFetching,
    });

    const getUserInfo = useCallback((userId: number) => {
        return staffInfo?.find(item => item.id === userId);
    }, [staffInfo]);

    useEffect(() => {
        if (selectedEmployee && !getUserInfo(selectedEmployee.id)) {
            setSelectedEmployee(null)
        }
    }, [getUserInfo, selectedEmployee]);

    return (
        <div
            data-bs-theme={'light'}
            className={'mt-2 p-1 d-flex w-100 pageContent'}
        >
            <div className={'d-flex flex-fill'} style={{overflow: 'hidden'}}>
                <div className={!selectedEmployee ? 'flex-fill' : ""} style={{overflow: 'auto'}}>
                    <StaffTable
                        ids={iDs || []}
                        getUserInfo={getUserInfo}
                        isLoading={infoIsFetching || infoIsLoading}
                        staffInfo={staffInfo}
                        userList={userList}
                        selectedEmployee={selectedEmployee}
                        setSelectedEmployee={setSelectedEmployee}
                    />
                </div>

                {selectedEmployee && (
                    <StaffDetails
                        isLoading={infoIsFetching || infoIsLoading}
                        selectedEmployee={selectedEmployee}
                        userInfo={getUserInfo(selectedEmployee.id)}
                    />
                )}
            </div>
        </div>
    );
};
