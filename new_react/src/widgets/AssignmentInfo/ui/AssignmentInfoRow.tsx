import {Assignment, AssignmentCoExecutorWrite} from "@entities/Assignment";
import {getEmployeeName, getHumansDatetime} from "@shared/lib";
import React, {useMemo, useState} from "react";
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import {CoExecutorRow} from "@widgets/AssignmentInfo/ui/CoExecutorRow";
import {Input} from "@mui/material";
import {Employee} from "@entities/Employee";

interface AssignmentInfoRowProps {
    assignment: Assignment;
    onSelect: (id: number) => void;
    selected: boolean;
    userList: Employee[];
}

export const AssignmentInfoRow = (props: AssignmentInfoRowProps) => {
    const {assignment, selected, onSelect, userList} = props;
    const [newCoExecutors, setNewCoExecutors] = useState<AssignmentCoExecutorWrite[]>([]);

    const getStatusProps = useMemo((): { bg: string, name: string } => {
        switch (assignment.status) {
            case 'await':
                return {bg: 'bg-light', name: 'В ожидании'}
            case 'in_work':
                return {bg: 'bg-primary', name: 'В работе'}
            case 'ready':
                if (assignment.inspector) {
                    return {bg: 'bg-success', name: 'Готов'}
                } else {
                    return {bg: 'bg-danger', name: 'Готов'}
                }
            case 'created':
                return {bg: 'bg-secondary', name: 'Создан'}
        }
    }, [assignment.inspector, assignment.status]);


    const usersInList = useMemo((): Employee[] => {
        const newUsers = newCoExecutors.map(coExecutor => coExecutor.co_executor_id);
        const oldUsers = assignment.co_executors.map(co_executor => co_executor.co_executor.id);
        const existIds = [...newUsers, ...oldUsers, assignment.executor && assignment.executor.id];

        return userList.filter(user => !existIds.includes(user.id));
    }, [assignment.co_executors, assignment.executor, newCoExecutors, userList]);


    const addNewCoexecutor = () => {
        if (usersInList.length > 1) {
            setNewCoExecutors(prevState => {
                return [...prevState, {
                    amount: 0,
                    assignment: assignment.id,
                    co_executor_id: usersInList[0].id,
                }]
            })
        }
    };

    const setCoExecutor = (co_executor: AssignmentCoExecutorWrite) => {
        setNewCoExecutors(prevCoExecutors => {
            const existingIndex = prevCoExecutors.findIndex(
                coExecutor => coExecutor.co_executor_id === co_executor.co_executor_id
            );

            if (existingIndex !== -1) {
                const updatedCoExecutors = [...prevCoExecutors];
                updatedCoExecutors[existingIndex] = co_executor;
                return updatedCoExecutors;
            } else {
                return prevCoExecutors;
            }
        });
    }

    const maxAddAmount = useMemo(() => {
        let newTax = 0;
        newCoExecutors.forEach(item => newTax += item.amount);
        assignment.co_executors.forEach(item => newTax += item.amount);

        return newTax;
    }, [assignment.co_executors, newCoExecutors]);

    const inputValue = useMemo(() => {
        if (assignment.new_tariff) {
            return assignment.new_tariff.amount - maxAddAmount;
        }
        return 0;
    }, [assignment.new_tariff, maxAddAmount])

    return (
        <>
            <tr className={'align-middle fs-7'}>
                <td className={'fs-5 p-0 px-1 text-center align-center'}>
                    <input
                        className="form-check-input"
                        type="checkbox"
                        checked={selected}
                        onChange={() => onSelect(assignment.id)}
                    />
                </td>
                <td>{assignment.appointed_by_boss && <i className="far fa-check-circle text-success"/>}</td>
                <td>{assignment.number}</td>
                <td className={'fs-7'}>
                    {getHumansDatetime(assignment.plane_date || '')}
                </td>


                <td>
                    {getEmployeeName(assignment.executor)}
                </td>

                <td>
                    {/*<button*/}
                    {/*    className={'appBtn circleBtn greenBtn fs-7'}*/}
                    {/*    onClick={addNewCoexecutor}*/}
                    {/*    style={{height: '25px', width: '25px'}}*/}
                    {/*>*/}
                    {/*    <PersonAddIcon fontSize={'small'}/>*/}
                    {/*</button>*/}
                </td>


                <td className={getStatusProps.bg}>
                    {getStatusProps.name}
                </td>


                <td className={'fs-7'}>
                    {getHumansDatetime(assignment.appointment_date || "")}
                </td>


                <td className={'fs-7'}>
                    {getHumansDatetime(assignment.date_completion || "")}
                </td>

                <td>
                    {getEmployeeName(assignment.inspector)}
                </td>

                <td className={'fs-7'}>
                    {getHumansDatetime(assignment.inspect_date || "")}
                </td>

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
            </tr>

            {/*{assignment.co_executors.map(co_executor => (*/}
            {/*    <CoExecutorRow maxValue={maxAddAmount + inputValue} co_executor={co_executor} key={co_executor.id}/>*/}
            {/*))}*/}

            {/*{newCoExecutors.map((co_executor, index) =>*/}
            {/*    <CoExecutorRow*/}
            {/*        maxValue={co_executor.amount + inputValue}*/}
            {/*        setCoExecutor={setCoExecutor}*/}
            {/*        new_co_executor={co_executor}*/}
            {/*        userList={usersInList}*/}
            {/*        key={co_executor.co_executor_id || index}*/}
            {/*    />*/}
            {/*)}*/}
        </>
    );
};
