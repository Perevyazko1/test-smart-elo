import {rtkAPI} from "@shared/api";
import {BaseEmployee, Employee} from "@entities/Employee";


interface UpdateUserProps {
    id: number;
    data: Partial<BaseEmployee>
}


const UserFormApi = rtkAPI.injectEndpoints({
        endpoints: (build) => ({
            createUser: build.mutation<Employee, Partial<BaseEmployee>>({
                query: (props: Partial<BaseEmployee>) => ({
                    url: '/staff/update_create_user/',
                    method: 'POST',
                    body: props,
                }),
                invalidatesTags: (result, error, {id}) => [
                    {type: 'UserList', id: result?.id || 'LIST'},
                ],
            }),
            updateUser: build.mutation<Employee, UpdateUserProps>({
                query: (props: UpdateUserProps) => ({
                    url: `/staff/update_create_user/${props.id}/`,
                    method: 'PATCH',
                    data: props.data,
                    body: props.data,
                }),
                invalidatesTags: (result, error, {id}) => [
                    {type: 'UserList', id: id},
                ],
            }),
        }),
    })
;

export const useCreateUser = UserFormApi.useCreateUserMutation;
export const useUpdateUser = UserFormApi.useUpdateUserMutation;