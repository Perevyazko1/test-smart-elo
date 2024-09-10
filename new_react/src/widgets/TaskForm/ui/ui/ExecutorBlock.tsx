import React, {useCallback, useMemo} from "react";

import {GroupedEmployeeItem} from "@entities/Employee";
import {Task, TaskExecutor, UpdateTask} from "@entities/Task";
import {useCurrentUser, useEmployeeName} from "@shared/hooks";
import {AppSelect, UserOptionRender} from "@shared/ui";
import {GetRenderOptionProps} from "@shared/ui/AppSelect/AppSelectMenu";

import {getTaskExecutor} from "../../model/lib";


interface ExecutorBlockProps {
    disabled: boolean;
    userList: GroupedEmployeeItem[];
    setFormDataClb: <K extends keyof UpdateTask>(key: K, value: UpdateTask[K]) => void;
    formTask: UpdateTask;
    task?: Task;
    isLoading: boolean;
}

export const ExecutorBlock = (props: ExecutorBlockProps) => {
    const {disabled, task, isLoading, formTask, userList, setFormDataClb} = props;
    const {currentUser} = useCurrentUser();
    const {getNameById} = useEmployeeName();
    
    const targetExecutor = useMemo(() => {
        if (Object.keys(formTask).includes('new_executor')) {
            return formTask.new_executor || null;
        }
        if (task && Object.keys(task).includes('new_executor')) {
            return task.new_executor || null;
        }
        return null;
    }, [formTask, task]);
    
    const onSelectClb = (newValue: TaskExecutor | null) => {
        const currentCoExecutors = formTask.new_co_executors || task?.new_co_executors || [];

        // Если новый исполнитель уже есть в соисполнителях - убираем его оттуда
        if (currentCoExecutors.some(item => item.employee === newValue?.employee)) {
            const updatedCoExecutors = currentCoExecutors.filter(item => item.employee !== newValue?.employee)
            setFormDataClb("new_co_executors", updatedCoExecutors);
        }

        setFormDataClb("new_executor", newValue);
        setFormDataClb("appointed_at", newValue ? new Date().toISOString() : null);
        setFormDataClb("appointed_by", newValue ? currentUser.id : null);
    };

    const getOptionLabelClb = useCallback((option: TaskExecutor | null) => {
        if (!option) {
            return "";
        }
        const userName = getNameById(option.employee, 'listNameInitials');

        if (option.amount) {
            return `${userName} (${option.amount})`;
        }
        return userName;
    }, [getNameById]);
    
    const coExecutorOptions = useMemo(() => {
        return userList.map(user => getTaskExecutor(user.user.id))
    },[userList]);
    
    const renderOption = useCallback((props: GetRenderOptionProps<TaskExecutor | null>) => {
        const userOption = userList.find(item => item.user.id === props.option?.employee);
        if (userOption) {
            const newHandleSelect = (option: GroupedEmployeeItem | null) => {
                if (option) {
                    props.handleSelect(getTaskExecutor(option.user.id, task, formTask))
                }
            }
            const newIsSelected = (option: GroupedEmployeeItem | null): boolean => {
                return targetExecutor?.employee === option?.user.id;
            }
            
            const newProps: GetRenderOptionProps<GroupedEmployeeItem> = {
                option: userOption,
                handleSelect: newHandleSelect,
                colorScheme: props.colorScheme,
                isSelected: newIsSelected,
            }
            return (
                <UserOptionRender {...newProps}/>
            )
        }
    }, [formTask, targetExecutor?.employee, task, userList]);

    return (
        <AppSelect
            bordered
            label={"Исполнитель"}
            variant={'select'}
            style={{width: 250}}
            colorScheme={'lightInput'}
            value={targetExecutor}
            readOnly={disabled}
            options={coExecutorOptions}
            getOptionLabel={getOptionLabelClb}
            getRenderOption={renderOption}
            isLoading={isLoading}
            onSelect={onSelectClb}
        />
    )
};
