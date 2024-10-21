import {rtkAPI} from "@shared/api";

import {Employee} from "../types/employee";


interface GetUserListProps {
    departments?: number[];
    piecework_wages?: boolean;
    ordering?: 'permanent_department';
    is_staff?: boolean;
    is_active?: boolean;
    user_departments_only?: boolean;
    find?: string;
}


const TaskFormApi = rtkAPI.injectEndpoints({
        endpoints: (build) => ({
            getUserList: build.query<Employee[], {}>({
                query: (props: GetUserListProps) => ({
                    url: '/staff/employees/',
                    params: props,
                }),
                providesTags: (result, error, arg) =>
                    result
                        ? [
                            ...result.map(({id}) => ({type: 'UserList' as const, id})),
                            {type: 'UserList', id: 'LIST'},
                        ]
                        : [{ type: 'UserList', id: 'LIST' }],
                keepUnusedDataFor: 6000,
            }),
            addToFavorite: build.mutation<Employee, { data: number }>({
                query: (props: { data: number }) => ({
                    url: '/staff/add_to_favorite/',
                    method: 'POST',
                    body: props,
                }),
            }),
        }),
    })
;

export const useEmployeeList = TaskFormApi.useGetUserListQuery;
export const useAddToFavorite = TaskFormApi.useAddToFavoriteMutation;
