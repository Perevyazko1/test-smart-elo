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


const TaskFormApi = rtkAPI.injectEndpoints({
        endpoints: (build) => ({
            getUserList: build.query<Employee[], {}>({
                query: (props: {}) => ({
                    url: '/staff/employees/',
                }),
            }),
            getDepartmentList: build.query<Department[], {}>({
                query: (props: {}) => ({
                    url: '/staff/departments/',
                }),
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
        }),
    })
;

export const useCreateTask = TaskFormApi.useCreateTaskMutation;
export const useUpdateTask = TaskFormApi.useUpdateTaskMutation;
export const useEmployeeList = TaskFormApi.useGetUserListQuery;
export const useDepartmentList = TaskFormApi.useGetDepartmentListQuery;
