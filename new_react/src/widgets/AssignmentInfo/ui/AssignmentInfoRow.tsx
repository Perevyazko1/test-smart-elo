import {Assignment, AssignmentCoExecutor} from "@entities/Assignment";
import {getHumansDatetime} from "@shared/lib";
import React, {ReactNode, useEffect, useMemo, useState} from "react";
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import {CoExecutorRow} from "@widgets/AssignmentInfo/ui/CoExecutorRow";
import {Input} from "@mui/material";
import {Employee} from "@entities/Employee";
import {useCurrentUser, useEmployeeName, usePermission} from "@shared/hooks";
import {APP_PERM} from "@shared/consts";

interface AssignmentInfoRowProps {
    assignment: Assignment;
    selectedUser: number | null;
    setSelectedUser: (userId: number | null) => void;
    selectedStatus: string | null;
    setSelectedStatus: (status: string | null) => void;
    onSelect: (id: number) => void;
    selected: boolean;
    userList: Employee[];
    disabled: boolean;
}

export const AssignmentInfoRow = (props: AssignmentInfoRowProps) => {
    const {assignment,
        selectedUser,
        setSelectedUser,
        selectedStatus,
        setSelectedStatus,
        disabled,
        selected,
        onSelect,
        userList,
    } = props;
    const {currentUser} = useCurrentUser();
    const {getNameById} = useEmployeeName();


    const [coExecutorsList, setCoExecutorsList] = useState<AssignmentCoExecutor[]>(assignment.co_executors);
    const hasBehalfPermission = usePermission(APP_PERM.BEHALF_ACTIONS)

    const getStatusProps = useMemo((): { icon: ReactNode, name: string } => {
        switch (assignment.status) {
            case 'await':
                return {icon: '', name: 'В ожидании'}
            case 'in_work':
                return {icon: <i className="fas fa-tools text-warning me-2 fs-6"/>, name: 'В работе'}
            case 'ready':
                if (assignment.inspector) {
                    return {icon: <i className="far fa-check-circle text-success me-2 fs-6"/>, name: 'Готов'}
                } else {
                    return {icon: <i className="far fa-check-circle text-danger me-2 fs-6"/>, name: 'Готов'}
                }
            case 'created':
                return {icon: '', name: 'Создан'}
        }
    }, [assignment.inspector, assignment.status]);

    const usersInList = useMemo((): Employee[] => {
        const oldUsers = coExecutorsList.map(co_executor => co_executor.co_executor);
        const existIds = [...oldUsers, assignment.executor];

        return userList.filter(user => !existIds.includes(user.id));
    }, [assignment.executor, coExecutorsList, userList]);

    useEffect(() => {
        setCoExecutorsList(prevState => {
            let newState = [...prevState];

            assignment.co_executors.forEach(co_executor => {
                const existingItem = newState.find(
                    item => item.co_executor === co_executor.co_executor
                );

                if (existingItem) {
                    newState = newState.map(item =>
                        item.co_executor === co_executor.co_executor ? co_executor : item
                    );
                } else {
                    newState.push(co_executor);
                }
            });
            return newState;
        });
    }, [assignment.co_executors]);


    const addNewCoexecutor = () => {
        if (usersInList.length > 0) {
            setCoExecutorsList(prevState => {
                return [...prevState, {
                    amount: 0,
                    assignment: assignment.id,
                    co_executor: usersInList[0].id,
                }]
            })
        }
    };

    const maxAddAmount = useMemo(() => {
        let newTax = 0;
        coExecutorsList.forEach(item => newTax += item.amount);

        return newTax;
    }, [coExecutorsList]);

    const inputValue = useMemo(() => {
        if (assignment.new_tariff) {
            return assignment.new_tariff.amount - maxAddAmount;
        }
        return 0;
    }, [assignment.new_tariff, maxAddAmount]);

    const setValueClb = (executorId: number, newValue: number) => {
        setCoExecutorsList(prevState => {
            return prevState.map(item =>
                item.co_executor === executorId ?
                    {
                        ...item,
                        amount: newValue
                    } :
                    item
            );
        });
    };

    const setUserClb = (prevUserId: number, newUserId: number | null) => {
        setCoExecutorsList(prevState => {
            const newUser = usersInList.find(user => user.id === newUserId)
            if (newUser && newUserId) {
                return prevState.map(item =>
                    item.co_executor === prevUserId ?
                        {
                            ...item,
                            co_executor: newUser.id
                        } :
                        item
                );
            } else {
                return prevState.filter(item => item.co_executor !== prevUserId)
            }
        });
    };

    const showNewCoExecutor = useMemo(() => {
        if (!!assignment.executor && !assignment.inspector) {
            if (assignment.executor === currentUser.id) {
                return true;
            }
            if (hasBehalfPermission) {
                return true;
            }
        }
        return false;
    }, [assignment.executor, assignment.inspector, currentUser.id, hasBehalfPermission]);

    const setSelectedExecutor = () => {
        if (selectedUser) {
            setSelectedUser(null);
        } else {
            setSelectedUser(assignment.executor || null);
        }
    };

    const executorCellBg = useMemo(() => {
        if (selectedUser) {
            return 'bg-warning';
        } else {
            return '';
        }
    }, [selectedUser]);

    const handleStatus = () => {
        if (selectedStatus) {
            setSelectedStatus(null);
        } else {
            setSelectedStatus(assignment.status);
        }
    };

    const statusCellBg = useMemo(() => {
        if (selectedStatus) {
            return 'bg-warning';
        } else {
            return '';
        }
    }, [selectedStatus]);

    return (
        <>
            <tr className={'align-middle fs-7'}>
                <td className={'fs-5 p-0 px-1 text-center align-center'}>
                    <input
                        className="form-check-input"
                        type="checkbox"
                        checked={selected}
                        disabled={disabled}
                        onChange={() => onSelect(assignment.id)}
                    />
                </td>
                <td>{assignment.appointed_by_boss && <i className="far fa-check-circle text-success"/>}</td>
                <td className={'fs-6 fw-bold'}>{assignment.number}</td>
                <td className={'fs-7 text-danger fw-bold'}>
                    {getHumansDatetime(assignment.plane_date || '')}
                </td>

                <td onClick={setSelectedExecutor} className={executorCellBg} style={{cursor: 'pointer'}}>
                    {getNameById(assignment.executor, 'listNameInitials')}
                </td>

                <td>
                    {showNewCoExecutor &&
                        <button
                            className={'appBtn circleBtn fs-7'}
                            onClick={addNewCoexecutor}
                            disabled={disabled}
                            style={{height: '25px', width: '25px'}}
                        >
                            <PersonAddIcon fontSize={'small'}/>
                        </button>
                    }
                </td>


                <td className={'text-nowrap ' + statusCellBg} onClick={handleStatus} style={{cursor: 'pointer'}}>
                    {getStatusProps.icon}
                    <b>{getStatusProps.name}</b>
                </td>


                <td className={'fs-7'}>
                    {getHumansDatetime(assignment.appointment_date || "")}
                </td>


                <td className={'fs-7'}>
                    {getHumansDatetime(assignment.date_completion || "")}
                </td>

                <td>
                    {getNameById(assignment.inspector, 'nameLastName')}
                </td>

                <td className={'fs-7'}>
                    {getHumansDatetime(assignment.inspect_date || "")}
                </td>

                {!!assignment.new_tariff &&
                    <td className={'align-middle pb-0'}>
                        <Input
                            value={inputValue}
                            size="small"
                            readOnly
                            className={'fw-bold'}
                            inputProps={{
                                type: 'number',
                                sx: {
                                    padding: 0,
                                }
                            }}
                        />
                    </td>
                }
            </tr>

            {coExecutorsList.map(co_executor => (
                <CoExecutorRow
                    disabled={!showNewCoExecutor || disabled}
                    maxValue={co_executor.amount + inputValue}
                    setValue={setValueClb}
                    setUser={setUserClb}
                    userList={co_executor.id ? [] : usersInList}
                    co_executor={co_executor}
                    key={co_executor.co_executor}
                />
            ))}
        </>
    );
};
