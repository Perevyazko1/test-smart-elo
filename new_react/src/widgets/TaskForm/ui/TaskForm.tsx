import React, {FormEvent, useEffect, useState} from "react";
import {Button} from "@mui/material";

import {useCurrentUser} from "@shared/hooks";
import {Task, TaskStatus, TaskUrgency, TaskViewMode} from "@pages/TaskPage";

import {CreateTask} from "../model/types";
import {useCreateTask, useEmployeeList, useUpdateTask} from "../model/api";

import {ImageUploadBlock} from "./ui/ImageUploadBlock";
import {DatesBlock} from "./ui/DatesBlock";
import {CreatedByBlock} from "./ui/CreatedByBlock";
import {ExecutorBlock} from "./ui/ExecutorBlock";
import {CoExecutorBlock} from "./ui/CoExecutorBlock";
import {ViewModeBlock} from "./ui/ViewModeBlock";
import {ForDepartmentBlock} from "./ui/ForDepartmentBlock";
import {RatingBlock} from "./ui/RatingBlock";
import {TextBlock} from "./ui/TextBlock";
import {convertDateTime, prepareFormData} from "@shared/lib";
import {AppointedByBlock} from "@widgets/TaskForm/ui/ui/AppointedByBlock";
import {DeadlineBlock} from "@widgets/TaskForm/ui/ui/DeadlineBlock";
import {InputGroup} from "react-bootstrap";
import {UpdateTask} from "@pages/TaskPage/model/types";


interface TaskFormProps {
    variant: 'create' | 'read_only' | 'edit';
    task?: Task;
    onSubmitClb?: () => void;
}


export const TaskForm = (props: TaskFormProps) => {
    const {task, variant, onSubmitClb} = props;
    const {currentUser} = useCurrentUser();
    const {data: userList, isLoading: usersIsLoading} = useEmployeeList({});
    const [createTask] = useCreateTask();
    const [updateTask] = useUpdateTask();

    const [formData, setFormData] = useState<CreateTask>({
        deadline: task?.deadline ? convertDateTime(task.deadline) : "",
        created_by: task?.created_by?.id || currentUser.id,
        status: task?.status || TaskStatus.Pending,
        title: task?.title || '',
        description: task?.description || '',
        urgency: task?.urgency || TaskUrgency.Normal,
        view_mode: task?.view_mode || TaskViewMode.OnlyMe,
        executor: task?.executor?.id || null,
        co_executors: task?.co_executors?.map(item => item.id) || [],
    });

    useEffect(() => {
        if (formData.view_mode !== TaskViewMode.DepartmentVisible && formData.for_department) {
            const newValue = {...formData};
            delete newValue.for_department;
            setFormData(newValue)
        }
    }, [formData]);

    const sortedUserList = [...(userList || [])].sort((a, b) => {
        if (a.current_department && b.current_department) {
            return a.current_department.number - b.current_department.number;
        } else {
            return a.id - b.id
        }
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (task?.id) {
            updateTask({
                id: task.id,
                data: prepareFormData(formData),
                updateMode: 'all',
            }).then(onSubmitClb)
        } else {
            createTask({
                data: prepareFormData(formData),
                updateMode: 'all',
            }).then(onSubmitClb)
        }
    };

    const cancelClb = () => {
        if (task?.id) {
            updateTask({
                id: task.id,
                data: prepareFormData({
                    ...formData,
                    status: TaskStatus.Cancelled,
                    ready_at: new Date().toISOString(),
                    co_executors: task.co_executors?.map(user => user.id),
                }),
                updateMode: 'all',
            }).then(onSubmitClb)
        }
    };

    const returnClb = () => {
        if (task?.id) {
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
            }).then(onSubmitClb)
        }
    }

    return (
        <form
            data-bs-theme={'light'}
            style={{minWidth: "50vw"}}
            onSubmit={handleSubmit}
        >
            {task ?
                <h4>Задача № {task.id} </h4>
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
                    value={formData.appointed_by ?
                        currentUser
                        :
                        task?.appointed_by
                    }
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
                    disabled={variant === 'read_only'}
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
                <ForDepartmentBlock
                    active={formData.view_mode === TaskViewMode.DepartmentVisible}
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

            <TextBlock
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
                        >
                            Отменить
                        </Button>
                        :

                        <Button
                            variant={'outlined'}
                            color="warning"
                            type={"button"}
                            disableElevation
                            onClick={returnClb}
                        >
                            Вернуть
                        </Button>
                    }

                </div>
            }
        </form>
    );
};
