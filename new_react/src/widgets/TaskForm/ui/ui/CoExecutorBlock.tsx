import React, {useCallback, useMemo} from "react";
import {GroupedEmployeeItem} from "@entities/Employee";
import {AppSelect, UserOptionRender} from "@shared/ui";
import {Task, TaskExecutor, TaskViewMode, UpdateTask} from "@entities/Task";

import {getTaskExecutor} from "../../model/lib";
import {useEmployeeName} from "@shared/hooks";
import {GetRenderOptionProps} from "@shared/ui/AppSelect/AppSelectMenu";


interface CoExecutorBlockProps {
    disabled: boolean;
    userList: GroupedEmployeeItem[];
    isLoading: boolean;
    setFormDataClb: <K extends keyof UpdateTask>(key: K, value: UpdateTask[K]) => void;
    formTask: UpdateTask;
    task?: Task;
}

export const CoExecutorBlock = (props: CoExecutorBlockProps) => {
    const {userList, task, formTask, disabled, isLoading, setFormDataClb} = props;
    const {getNameById} = useEmployeeName();

    const targetCoExecutors = useMemo(() => {
        if (Object.keys(formTask).includes('new_co_executors')) {
            return formTask.new_co_executors || [];
        }
        if (task && Object.keys(task).includes('new_co_executors')) {
            return task.new_co_executors || [];
        }
        return [];
    }, [formTask, task]);

    const onSelectClb = (newValue: TaskExecutor[] | null) => {
        const currentExecutor = formTask.new_executor || task?.new_executor;

        // Если в новых соисполнителях есть ответственный за задачу - убираем его
        if (newValue?.some(item => item.employee === currentExecutor?.employee)) {
            setFormDataClb("new_executor", null);
        }

        setFormDataClb("new_co_executors", newValue || []);
    };
    
    const coExecutorOptions = useMemo(() => {
        return userList.map(user => getTaskExecutor(user.user.id))
    },[userList]);

    const getOptionLabelClb = useCallback((option: TaskExecutor) => {
        const userName = getNameById(option.employee, 'listNameInitials');

        if (option.amount) {
            return `${userName} (${option.amount})`;
        }
        return userName;
    }, [getNameById]);

    const renderOption = useCallback((props: GetRenderOptionProps<TaskExecutor>) => {
        const userOption = userList.find(item => item.user.id === props.option?.employee);
        if (userOption) {
            const newHandleSelect = (option: GroupedEmployeeItem | null) => {
                if (option) {
                    props.handleSelect(getTaskExecutor(option.user.id, task, formTask))
                }
            }
            const newIsSelected = (option: GroupedEmployeeItem | null): boolean => {
                return targetCoExecutors.some(item => item.employee === option?.user.id)
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
    }, [formTask, targetCoExecutors, task, userList]);

    const lockedViewMode = useMemo(() => {
        if (formTask.view_mode === TaskViewMode.OnlyMe) {
            return true;
        } else if (task?.view_mode === TaskViewMode.OnlyMe) {
            return true;
        }
        return false;
    }, [formTask.view_mode, task?.view_mode]);

    return (
        <AppSelect
            bordered
            variant={'multiple'}
            colorScheme={'lightInput'}
            label={"Соисполнители / Наблюдатели"}
            className={'flex-fill'}
            readOnly={disabled || lockedViewMode}
            isLoading={isLoading}
            value={targetCoExecutors}
            onSelect={onSelectClb}
            options={coExecutorOptions}
            getOptionLabel={getOptionLabelClb}
            getRenderOption={renderOption}
        />
    );
};
