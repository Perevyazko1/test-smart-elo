import {rtkAPI} from "@shared/api";

import {NewTask, NewTaskComment, Task, TaskComment, UpdateTask} from "@entities/Task";

interface UpdateTaskProps {
    id: number,
    data: UpdateTask,
    updateMode: 'all' | 'excludeMe' | 'none',
}

interface CreateTaskProps {
    data: NewTask,
    updateMode: 'all' | 'excludeMe' | 'none',
}


const TaskFormApi = rtkAPI.injectEndpoints({
        endpoints: (build) => ({
            getTaskComments: build.query<TaskComment[], {task: number}>({
                query: (props: {task: number}) => ({
                    url: '/tasks/task_comments/',
                    params: props,
                }),
                providesTags: () => [{type: 'TaskComments', id: 'ALL'}]
            }),
            createTaskComment: build.mutation<TaskComment, NewTaskComment>({
                query: (props: NewTaskComment) => ({
                    url: '/tasks/task_comments/',
                    method: 'POST',
                    body: props,
                }),
                invalidatesTags: [
                    {type: 'TaskComments', id: 'ALL'},
                ],
            }),
            createTask: build.mutation<Task, CreateTaskProps>({
                query: (props: CreateTaskProps) => ({
                    url: '/tasks/tasks/',
                    params: {
                        update_mode: props.updateMode
                    },
                    method: 'POST',
                    data: props.data,
                    body: props.data,
                }),
            }),
            updateTaskViewInfo: build.mutation<any, { employeeId: number, taskId: number }>({
                query: (props: { employeeId: number, taskId: number }) => ({
                    url: '/tasks/task_view_info/update_view/',
                    params: {},
                    method: 'POST',
                    body: {
                        employee_id: props.employeeId,
                        task_id: props.taskId,
                    },
                }),
            }),
            createTaskImage: build.mutation<any, FormData>({
                query: (props: FormData) => ({
                    url: `/tasks/task_images/`,
                    params: {},
                    method: 'POST',
                    data: props,
                    body: props,
                }),
            }),
            deleteTaskImage: build.mutation<void, number>({
                query: (id: number) => ({
                    url: `/tasks/task_images/${id}/`,
                    method: 'DELETE',
                }),
            }),
            updateTask: build.mutation<Task, UpdateTaskProps>({
                query: (props: UpdateTaskProps) => ({
                    url: `/tasks/tasks/${props.id}/`,
                    params: {
                        update_mode: props.updateMode
                    },
                    method: 'PATCH',
                    data: props.data,
                    body: props.data,
                }),
            }),
        }),
    })
;

export const useCreateTask = TaskFormApi.useCreateTaskMutation;
export const useTaskCommentList = TaskFormApi.useGetTaskCommentsQuery;
export const useUpdateTask = TaskFormApi.useUpdateTaskMutation;
export const useDeleteTaskImage = TaskFormApi.useDeleteTaskImageMutation;
export const useTaskUpdateViewInfo = TaskFormApi.useUpdateTaskViewInfoMutation;
export const useCreateTaskComment = TaskFormApi.useCreateTaskCommentMutation;
export const useCreateTaskImage = TaskFormApi.useCreateTaskImageMutation;
