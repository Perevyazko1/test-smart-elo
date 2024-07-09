import React, {FormEvent, useEffect, useMemo, useState} from "react";
import {InputGroup} from "react-bootstrap";
import {Button} from "@mui/material";

import {convertDateTime, prepareFormData} from "@shared/lib";
import {useCurrentUser} from "@shared/hooks";
import {Task, TaskStatus, TaskUrgency, TaskViewMode} from "@pages/TaskPage";
import {UpdateTask} from "@pages/TaskPage/model/types";
import {getStatusText} from "@pages/TaskPage/model/lib";

import {CreateTask} from "../model/types";
import {useCreateTask, useEmployeeList, useUpdateTask} from "../model/api";

import {ImageUploadBlock} from "./ui/ImageUploadBlock";
import {DatesBlock} from "./ui/DatesBlock";
import {CreatedByBlock} from "./ui/CreatedByBlock";
import {ExecutorBlock} from "./ui/ExecutorBlock";
import {CoExecutorBlock} from "./ui/CoExecutorBlock";
import {ViewModeBlock} from "./ui/ViewModeBlock";
import {RatingBlock} from "./ui/RatingBlock";
import {TextTitleBlock} from "./ui/TextTitleBlock";
import {AppointedByBlock} from "./ui/AppointedByBlock";
import {DeadlineBlock} from "./ui/DeadlineBlock";
import {TextDescriptionBlock} from "./ui/TextDescriptionBlock";
import {ForDepartmentsBlock} from "./ui/ForDepartmentsBlock";


interface TaskFormProps {
    variant: 'create' | 'read_only' | 'edit';
    task?: Task;
    onSubmitClb?: () => void;
}


export const TaskForm = (props: TaskFormProps) => {
    const {task, variant, onSubmitClb} = props;
    const {currentUser} = useCurrentUser();
    const {data: userList, isLoading: usersIsLoading} = useEmployeeList({});
    const [createTask, {isLoading: isCreated}] = useCreateTask();
    const [updateTask, {isLoading: isUpdated}] = useUpdateTask();

    const [formData, setFormData] = useState<CreateTask>({
        deadline: task?.deadline ? convertDateTime(task.deadline) : "",
        created_by: task?.created_by?.id || currentUser.id,
        status: task?.status || TaskStatus.Pending,
        title: task?.title || '',
        description: task?.description || '',
        urgency: task?.urgency || TaskUrgency.Normal,
        view_mode: task?.view_mode || TaskViewMode.ForParticipants,
        for_departments: task?.for_departments?.map(department => department.id) || [],
        executor: task?.executor?.id || null,
        co_executors: task?.co_executors?.map(item => item.id) || [],
        appointed_by: task?.appointed_by?.id || null,
    });

    const sortedUserList = useMemo(() => {
        return [...(userList || [])].sort((a, b) => {
            if (a.permanent_department && b.permanent_department) {
                return a.permanent_department.number - b.permanent_department.number;
            } else {
                return a.id - b.id
            }
        })
    }, [userList]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (task?.id) {
            updateTask({
                id: task.id,
                data: prepareFormData(formData),
                updateMode: 'all',
            }).then(() => {
                alert('Задача изменена ✅');
                if (onSubmitClb) {
                    onSubmitClb();
                }
            })
        } else {
            createTask({
                data: prepareFormData(formData),
                updateMode: 'all',
            }).then(() => {
                alert('Задача создана ✅');
                if (onSubmitClb) {
                    onSubmitClb();
                }
            });
        }
    };

    const cancelClb = () => {
        if (task?.id) {
            if (window.confirm("Отменить задачу?")) {
                updateTask({
                    id: task.id,
                    data: prepareFormData({
                        ...formData,
                        status: TaskStatus.Cancelled,
                        ready_at: new Date().toISOString(),
                        co_executors: task.co_executors?.map(user => user.id),
                    }),
                    updateMode: 'all',
                }).then(() => {
                    alert('Задача отменена ❌. Найти данную задачу можно в режиме просмотра "Отмененные" раздел завершенных. ');
                    if (onSubmitClb) {
                        onSubmitClb();
                    }
                });
            }
        }
    };

    const returnClb = () => {
        if (task?.id) {
            if (window.confirm("Вернуть задачу?")) {

                const data: UpdateTask = {
                    id: task.id,
                    status: TaskStatus.Pending,
                    co_executors: task.co_executors?.map(user => user.id),
                    ready_at: '',
                }
                if (task.appointed_by?.id === currentUser.id) {
                    data.appointed_by = null;
                    data.appointed_at = '';
                    if (task.executor?.id === currentUser.id) {
                        data.executor = null;
                    }
                }

                updateTask({
                    id: task.id,
                    data: prepareFormData(data),
                    updateMode: 'all',
                }).then(() => {
                    alert('Задача возвращена в блок ожидания. Что бы увидеть задачу - переключите режим просмотра. ');
                    if (onSubmitClb) {
                        onSubmitClb();
                    }
                });
            }
        }
    }

    useEffect(() => {
        if (formData.view_mode !== TaskViewMode.DepartmentVisible && formData.for_departments) {
            setFormData({
                ...formData,
                for_departments: []
            })
        }
        if (formData.view_mode === TaskViewMode.OnlyMe && formData.executor !== currentUser.id) {
            setFormData({
                ...formData,
                executor: currentUser.id,
                co_executors: [],
                appointed_at: new Date().toISOString(),
                appointed_by: currentUser.id,
            })
        }
        //eslint-disable-next-line
    }, [formData.view_mode]);

    return (
        <form
            data-bs-theme={'light'}
            style={{minWidth: "50vw"}}
            onSubmit={handleSubmit}
        >
            {task ?
                <h4>Задача № {task.id} (статус: {getStatusText(task.status)}) </h4>
                :
                <h4>Новая задача</h4>
            }
            <hr/>

            <div className={'d-flex justify-content-between gap-3'}>
                <ImageUploadBlock
                    disabled={variant === "read_only"}
                    task={task}
                    formTask={formData}
                    setFormTask={setFormData}
                />
                <div>

                    <DeadlineBlock
                        disabled={variant === "read_only"}
                        setFormTask={setFormData}
                        formData={formData}
                    />
                    <hr/>
                    <DatesBlock
                        task={task}
                    />
                </div>
            </div>

            <hr/>

            <div className="d-flex align-items-end gap-3 mb-3">
                <CreatedByBlock
                    value={task?.created_by || currentUser}
                />
                <AppointedByBlock
                    isLoading={usersIsLoading}
                    userList={sortedUserList || []}
                    value={task?.appointed_by?.id || formData.appointed_by || null}
                />

                <InputGroup className={'w-auto'}>
                    <InputGroup.Text style={{width: '150px'}} className={'text-muted fs-7'}>
                        Назначена:
                    </InputGroup.Text>
                    <input
                        type="datetime-local"
                        disabled
                        value={convertDateTime(formData.appointed_at || task?.appointed_at)}
                    />
                </InputGroup>
            </div>

            <div className="d-flex gap-3 mb-3">
                <ExecutorBlock
                    disabled={variant === 'read_only'
                        || (!!task && task?.status !== TaskStatus.Pending)
                        || formData.view_mode === TaskViewMode.OnlyMe
                    }
                    setFormTask={setFormData}
                    formTask={formData}
                    isLoading={usersIsLoading}
                    userList={sortedUserList || []}
                />
                <CoExecutorBlock
                    disabled={variant === 'read_only'}
                    setFormTask={setFormData}
                    formTask={formData}
                    isLoading={usersIsLoading}
                    userList={sortedUserList || []}
                />

            </div>

            <div className="d-flex gap-3">
                <ViewModeBlock
                    disabled={variant === "read_only"}
                    formTask={formData}
                    setFormTask={setFormData}
                />
                <ForDepartmentsBlock
                    active={formData.view_mode === TaskViewMode.DepartmentVisible && variant !== "read_only"}
                    formTask={formData}
                    setFormTask={setFormData}
                />
                <RatingBlock
                    disabled={variant === "read_only"}
                    formTask={formData}
                    setFormTask={setFormData}
                />
            </div>
            <hr/>

            <TextTitleBlock
                disabled={variant === "read_only"}
                formTask={formData}
                setFormTask={setFormData}
            />

            <TextDescriptionBlock
                disabled={variant === "read_only"}
                formTask={formData}
                setFormTask={setFormData}
            />

            <hr/>


            {variant === "create" &&
                <Button
                    variant={'outlined'}
                    color="inherit"
                    type={"submit"}
                    disableElevation
                    disabled={isCreated || isUpdated}
                >
                    Создать задачу
                </Button>
            }

            {variant === 'edit' &&
                <div>
                    <Button
                        className={'me-2'}
                        variant={'outlined'}
                        color="inherit"
                        type={"submit"}
                        disableElevation
                        disabled={isCreated || isUpdated}
                    >
                        Изменить
                    </Button>

                    {formData.status !== TaskStatus.Cancelled
                        ?
                        <Button
                            variant={'outlined'}
                            color="warning"
                            type={"button"}
                            disableElevation
                            onClick={cancelClb}
                            disabled={isCreated || isUpdated}
                        >
                            Удалить
                        </Button>
                        :

                        <Button
                            variant={'outlined'}
                            color="warning"
                            type={"button"}
                            disableElevation
                            onClick={returnClb}
                            disabled={isCreated || isUpdated}
                        >
                            Вернуть
                        </Button>
                    }

                </div>
            }
        </form>
    );
};
