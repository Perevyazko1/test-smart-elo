import React, {FormEvent, useEffect, useMemo, useState} from "react";

import {Button} from "@mui/material";

import {NewTask, Task, TaskStatus, TaskViewMode, UpdateTask} from "@entities/Task";
import {useSortedUserList} from "@entities/Employee";
import {taskPageActions} from "@pages/TaskPage";
import {prepareFormData} from "@shared/lib";
import {useAppDispatch, useCurrentUser} from "@shared/hooks";

import {useCreateTask, useCreateTaskImage, useTaskUpdateViewInfo, useUpdateTask} from "../model/api";

import {TaskTitle} from "./ui/TaskTitle";
import {ImageUploadBlock} from "./ui/ImageUploadBlock";
import {DeadlineBlock} from "./ui/DeadlineBlock";
import {DatesBlock} from "./ui/DatesBlock";
import {CreatedByBlock} from "./ui/CreatedByBlock";
import {AppointedByBlock} from "./ui/AppointedByBlock";
import {AmountBlock} from "./ui/AmountBlock";
import {ExecutorBlock} from "./ui/ExecutorBlock";
import {CoExecutorBlock} from "./ui/CoExecutorBlock";
import {AmountDetailBlock} from "./ui/AmountDetailBlock";
import {ViewModeBlock} from "./ui/ViewModeBlock";
import {ForDepartmentsBlock} from "./ui/ForDepartmentsBlock";
import {RatingBlock} from "./ui/RatingBlock";
import {TextTitleBlock} from "./ui/TextTitleBlock";
import {TextDescriptionBlock} from "./ui/TextDescriptionBlock";
import {CommentBlock} from "./ui/CommentBlock";


interface TaskFormProps {
    task?: Task;
    onSubmitClb?: () => void;
    variant: 'create' | 'read_only' | 'edit';
}

export const TaskForm = (props: TaskFormProps) => {
    const {task, variant, onSubmitClb} = props;
    const dispatch = useAppDispatch();

    const {currentUser} = useCurrentUser();
    const {sortedUserList, usersIsLoading} = useSortedUserList();

    const [createTask, {isLoading: isCreated}] = useCreateTask();
    const [updateTask, {isLoading: isUpdated}] = useUpdateTask();
    const [createTaskImage, {isLoading}] = useCreateTaskImage();
    const [updateViewInfo] = useTaskUpdateViewInfo();

    const [showAmountDetail, setShowAmountDetail] = useState(false);

    const [formData, setFormData] = useState<UpdateTask>({});
    const [newImageList, setNewImageList] = useState<File[]>([]);

    const setFormDataClb = <K extends keyof UpdateTask>(key: K, value: UpdateTask[K]) => {
        setFormData((prevFormData) => {
            const newFormData = {...prevFormData};

            if (task) {
                if (task[key] !== value) {
                    newFormData[key] = value;
                } else {
                    delete newFormData[key];
                }
            } else {
                if (!value) {
                    delete newFormData[key];
                } else {
                    newFormData[key] = value;
                }
            }

            return newFormData;
        });
    };

    useEffect(() => {
        if (task?.id) {
            updateViewInfo({
                employeeId: currentUser.id,
                taskId: task.id,
            }).then(() => {
                dispatch(taskPageActions.addNoRelevantId(task.id));
            })
        }
    }, [currentUser.id, dispatch, task?.id, updateViewInfo]);

    const uploadImages = async (taskId: number) => {
        const fetchImage = async (image: File) => {
            await createTaskImage(prepareFormData({
                task: taskId,
                image: image,
            }))
        }

        if (newImageList.length > 0) {
            newImageList.forEach(
                file => fetchImage(file)
            )
        }
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (task?.id) {
            if (Object.keys(formData).length > 0) {
                await updateTask({
                    id: task.id,
                    data: formData,
                    updateMode: 'all',
                })
            }
            await uploadImages(task.id)

            alert('Задача изменена ✅');
        } else {
            const newTaskData: NewTask = {
                ...formData,
                created_by: currentUser.id,
                view_mode: formData.view_mode || TaskViewMode.ForParticipants,
            }
            const data = await createTask({
                data: newTaskData,
                updateMode: 'all',
            }).unwrap()
            await uploadImages(data.id)
            alert('Задача создана ✅');
        }
        if (onSubmitClb) {
            onSubmitClb();
        }
    };

    const cancelClb = () => {
        if (task?.id) {
            if (window.confirm("Отменить задачу?")) {
                updateTask({
                    id: task.id,
                    data: {
                        ...formData,
                        status: TaskStatus.Cancelled,
                        ready_at: new Date().toISOString(),
                    },
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
                    ready_at: null,
                }
                if (task.appointed_by === currentUser.id) {
                    data.appointed_by = null;
                    data.appointed_at = null;
                    if (task.new_executor?.employee === currentUser.id) {
                        data.new_executor = null;
                    }
                }

                updateTask({
                    id: task.id,
                    data: data,
                    updateMode: 'all',
                }).then(() => {
                    alert('Задача возвращена в блок ожидания. Что бы увидеть задачу - переключите режим просмотра. ');
                    if (onSubmitClb) {
                        onSubmitClb();
                    }
                });
            }
        }
    };

    const showEditBtn = useMemo(() => {
        return !task?.verified_at &&
            (Object.keys(formData).length > 0 || newImageList.length > 0)
    }, [formData, newImageList.length, task?.verified_at]);

    return (
        <form
            data-bs-theme={'light'}
            className={'d-flex flex-column gap-1 p-1'}
            style={{minWidth: "50vw"}}
            onSubmit={handleSubmit}
        >
            <TaskTitle task={task}/>

            <hr className={'m-0 mb-1'}/>

            <div className={'d-flex justify-content-between gap-2'}>
                <ImageUploadBlock
                    setNewImageList={setNewImageList}
                    disabled={variant === "read_only"}
                    task={task}
                />

                <div style={{maxWidth: "370px"}}>
                    <DeadlineBlock
                        disabled={variant === "read_only"}
                        setFormDataClb={setFormDataClb}
                        deadline={formData.deadline || task?.deadline || null}
                    />

                    <hr className={'m-1'}/>

                    <DatesBlock
                        task={task}
                        formData={formData}
                    />
                </div>
            </div>

            <hr className={'m-2'}/>

            <div className={'d-flex gap-2 flex-column'}>
                <div className="d-flex flex-wrap flex-fill gap-2">
                    <CreatedByBlock
                        value={task?.created_by || currentUser.id}
                    />
                    <AppointedByBlock
                        value={task?.appointed_by || formData.appointed_by || null}
                    />

                    <AmountBlock
                        task={task}
                        disabled={variant === 'read_only'}
                        formTask={formData}
                        setFormDataClb={setFormDataClb}
                        showAmountDetail={showAmountDetail}
                        setShowAmountDetail={setShowAmountDetail}
                    />
                </div>

                <div className="d-flex gap-2 flex-fill flex-wrap">
                    <ExecutorBlock
                        task={task}
                        disabled={variant === 'read_only'
                            || (!!task && task?.status !== TaskStatus.Pending)
                            || formData.view_mode === TaskViewMode.OnlyMe
                        }
                        setFormDataClb={setFormDataClb}
                        formTask={formData}
                        isLoading={usersIsLoading}
                        userList={sortedUserList}
                    />

                    <CoExecutorBlock
                        disabled={variant === 'read_only'}
                        task={task}
                        setFormDataClb={setFormDataClb}
                        formTask={formData}
                        isLoading={usersIsLoading}
                        userList={sortedUserList}
                    />

                </div>

                {showAmountDetail &&
                    <div>
                        <AmountDetailBlock
                            task={task}
                            formTask={formData}
                            setFormDataClb={setFormDataClb}
                        />
                    </div>
                }
                <div className="d-flex gap-2 flex-fill flex-wrap">
                    <ViewModeBlock
                        task={task}
                        disabled={variant === "read_only"}
                        formTask={formData}
                        setFormDataClb={setFormDataClb}
                    />
                    <ForDepartmentsBlock
                        task={task}
                        active={variant !== "read_only" && (
                            formData.view_mode === TaskViewMode.DepartmentVisible ||
                            (!formData.view_mode && task?.view_mode === TaskViewMode.DepartmentVisible))
                        }
                        formTask={formData}
                        setFormDataClb={setFormDataClb}
                    />

                    <RatingBlock
                        task={task}
                        disabled={variant === "read_only"}
                        formTask={formData}
                        setFormDataClb={setFormDataClb}
                    />
                </div>

                <hr className={'m-1'}/>
                <div className={'d-flex flex-wrap gap-2'}>
                    <TextTitleBlock
                        task={task}
                        disabled={variant === "read_only"}
                        formTask={formData}
                        setFormDataClb={setFormDataClb}
                    />

                    <TextDescriptionBlock
                        task={task}
                        disabled={variant === "read_only"}
                        formTask={formData}
                        setFormDataClb={setFormDataClb}
                    />

                    {task ?
                        <CommentBlock task={task}/>
                        : null
                    }

                </div>
                <hr className={'m-1'}/>

                <div className={'d-flex gap-2 pb-3'}>
                    {variant === "create" &&
                        <Button
                            variant={'outlined'}
                            color="inherit"
                            type={"submit"}
                            disableElevation
                            disabled={isCreated || isUpdated || isLoading}
                        >
                            Создать задачу
                        </Button>
                    }
                    {
                        showEditBtn &&
                        <Button
                            variant={'outlined'}
                            color="inherit"
                            type={"submit"}
                            disableElevation
                            disabled={isCreated || isUpdated || isLoading}
                        >
                            Изменить
                        </Button>
                    }

                    {variant === 'edit' &&
                        <>
                            {
                                task?.status !== TaskStatus.Cancelled
                                    ?
                                    <Button
                                        variant={'outlined'}
                                        color="warning"
                                        type={"button"}
                                        disableElevation
                                        onClick={cancelClb}
                                        disabled={isCreated || isUpdated || isLoading}
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
                                        disabled={isCreated || isUpdated || isLoading}
                                    >
                                        Вернуть
                                    </Button>
                            }

                        </>
                    }

                </div>

            </div>
        </form>
    );
};
