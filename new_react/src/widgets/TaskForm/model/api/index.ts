import {Employee} from "@entities/Employee";
import {rtkAPI} from "@shared/api";

import {Department} from "@entities/Department";
import {Task} from "@pages/TaskPage";

interface UpdateTaskProps {
    id: number,
    data: FormData,
    updateMode: 'all' | 'excludeMe' | 'none',
}

interface CreateTaskProps {
    data: FormData,
    updateMode: 'all' | 'excludeMe' | 'none',
}


interface GetUserListProps {
    departments?: number[];
    is_staff?: boolean;
}


const TaskFormApi = rtkAPI.injectEndpoints({
        endpoints: (build) => ({
            getUserList: build.query<Employee[], {}>({
                query: (props: GetUserListProps) => ({
                    url: '/staff/employees/',
                    params: props,
                }),
                keepUnusedDataFor: 6000,
            }),
            getDepartmentList: build.query<Department[], {}>({
                query: (props: {}) => ({
                    url: '/staff/departments/',
                }),
                keepUnusedDataFor: 6000,
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
            deleteTaskImage: build.mutation<void, number>({
                query: (id: number) => ({
                    url: `/tasks/task_images/${id}/`,
                    method: 'DELETE',
                }),
            }),
            addToFavorite: build.mutation<Employee, {data: number}>({
                query: (props: {data: number}) => ({
                    url: '/staff/add_to_favorite/',
                    method: 'POST',
                    body: props,
                }),
            }),
        }),
    })
;

export const useCreateTask = TaskFormApi.useCreateTaskMutation;
export const useUpdateTask = TaskFormApi.useUpdateTaskMutation;
export const useDeleteTaskImage = TaskFormApi.useDeleteTaskImageMutation;
export const useEmployeeList = TaskFormApi.useGetUserListQuery;
export const useAddToFavorite = TaskFormApi.useAddToFavoriteMutation;
export const useDepartmentList = TaskFormApi.useGetDepartmentListQuery;
