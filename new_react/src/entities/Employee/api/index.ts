import {rtkAPI} from "@shared/api";
import {Employee} from "../types/employee";


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
