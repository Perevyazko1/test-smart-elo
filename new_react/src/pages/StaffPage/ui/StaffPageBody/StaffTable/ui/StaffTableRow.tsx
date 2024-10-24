import React, {useEffect, useState} from "react";

import {Employee} from "@entities/Employee";
import {useUpdateUser} from "@widgets/UserForm";
import {AppSwitch} from "@shared/ui";
import {useAppQuery, useEmployeeName, useFormattedValue} from "@shared/hooks";

import {StaffInfo} from "../../../../model/types";
import {Spinner} from "react-bootstrap";

interface StaffTableRowProps {
    user: Employee;
    userInfo: StaffInfo | undefined;
    selectedEmployee: Employee | null;
    setSelectedEmployee: (option: Employee | null) => void;
}

export const StaffTableRow = (props: StaffTableRowProps) => {
    const {
        user,
        userInfo,
        selectedEmployee,
        setSelectedEmployee,
    } = props;

    const [isActive, setIsActive] = useState(user.attention);
    const [updateUser, {isLoading}] = useUpdateUser();

    useEffect(() => {
        if (isActive !== user.attention) {
            updateUser({
                id: user.id,
                data: {
                    attention: !user.attention,
                }
            })
        }
    }, [isActive, updateUser, user.attention, user.id])


    const {getNameById} = useEmployeeName();
    const {setQueryParam, queryParameters} = useAppQuery();

    const {formatValue} = useFormattedValue();

    const setDepartmentHandle = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        event.stopPropagation();
        if (queryParameters.permanent_department__id || !user.permanent_department) {
            setQueryParam('permanent_department__id', '');
        } else {
            setQueryParam('permanent_department__id', String(user.permanent_department.id));
        }
    }

    return (
        <tr
            style={{cursor: 'pointer'}}
            onClick={() => setSelectedEmployee((selectedEmployee?.id === user.id) ? null : user)}
        >
            <td style={{minHeight: 55, height: 55}}
                className={selectedEmployee?.id === user.id ? 'bg-info-subtle fw-bold border border-2 border-black border-end-0' : ''}>
                <div className={'d-flex'}>
                    {getNameById(user.id, 'listNameInitials')}
                    <AppSwitch
                        style={{transform: "scale(0.7) translate(0, 7px)", fontSize: '10px'}}
                        checked={isActive}
                        onSwitch={() => setIsActive(!isActive)}
                        labelPosition={'labelRight'}
                        handleContent={
                            isLoading ? (
                                <Spinner size={'sm'} animation={'grow'}/>
                            ) : (
                                '❗'
                            )
                        }

                    />
                </div>
            </td>

            {!selectedEmployee && (
                <>
                    <td style={{maxWidth: '130px', width: '130px'}}>
                        <button
                            className={'appBtn px-1 fs-7'}
                            style={{
                                backgroundColor:
                                    user.permanent_department ?
                                        user.permanent_department.color :
                                        "#FFFFFF",
                            }}
                            onClick={setDepartmentHandle}
                        >
                            {user.permanent_department?.name || "ОСНОВНОЙ ОТДЕЛ НЕ УКАЗАН"}
                        </button>
                    </td>

                    <td className={'fw-bold text-end px-2'} style={{fontSize: 13}}>
                        {formatValue(user.current_balance).strValue}
                    </td>
                    <td>
                        {user.piecework_wages ? "🪙" : "⏱️"}
                    </td>
                    {userInfo && Object.entries(userInfo.user_total_info).map(([key, value]) => (
                        <td className={'fs-7'} key={key}>
                            <div className={'d-flex gap-1 align-items-top'}>
                                <span  className={value.accrual === 0 ? "text-muted" : "fw-bold"}>
                                    {formatValue(value.accrual).strValue}
                                </span>
                                <span style={{fontSize: 6, paddingTop: 2}}>
                                    {value.pre_accrual > 0 && "🔴"}
                                </span>
                            </div>
                            <hr className={'m-0 mt-1 p-0'}/>

                            <div className={'d-flex gap-1 align-items-top'}>
                                <span className={value.debit === 0 ? "text-muted" : "fw-bold"}>
                                    {formatValue(-value.debit).strValue}
                                </span>
                                <span style={{fontSize: 6, paddingTop: 2}}>
                                    {value.pre_debit > 0 && "🔴"}
                                </span>
                            </div>
                        </td>
                    ))
                    }
                </>
            )}
        </tr>
    );
};
