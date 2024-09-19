import {rtkAPI} from "@shared/api";
import {Assignment, AssignmentCoExecutorWrite} from "@entities/Assignment";

interface AssignmentInfoApiProps {
    department__id: number;
    order_product__series_id: string;
}

interface EditAssignmentsInfoProps {
    ids: number[];
    mode: 'in_work' | 'all' | 'selected' | 'await' | 'remove_visa' | 'lock_await_assignments';
    department__id: number;
    date: string;
    series_id: string;
}

const AssignmentInfoApi = rtkAPI.injectEndpoints({
    endpoints: (build) => ({
        getAssignmentsInfo: build.query<Assignment[], AssignmentInfoApiProps>({
            query: (props: AssignmentInfoApiProps) => ({
                url: '/core/assignments/',
                method: 'GET',
                params: {
                    ...props,
                }
            }),
            providesTags: () => [{type: 'AssignmentInfo', id: 'AssignmentInfo'}]
        }),
        editAssignments: build.mutation<any, EditAssignmentsInfoProps>({
            query: (props: EditAssignmentsInfoProps) => ({
                url: '/core/update_assignments_info/',
                method: 'POST',
                body: props,
            }),
            invalidatesTags: [
                {type: 'AssignmentInfo', id: 'AssignmentInfo'},
            ],
        }),
        updateCoExecutor: build.mutation<any, AssignmentCoExecutorWrite>({
            query: (props: AssignmentCoExecutorWrite) => ({
                url: `/core/update_co_executor/`,
                method: 'POST',
                body: props,
            }),
            invalidatesTags: [
                {type: 'AssignmentInfo', id: 'AssignmentInfo'},
            ],
        }),
    }),
});

export const useGetAssignmentInfo = AssignmentInfoApi.useGetAssignmentsInfoQuery;
export const useEditAssignmentInfo = AssignmentInfoApi.useEditAssignmentsMutation;
export const useUpdateCoExecutor = AssignmentInfoApi.useUpdateCoExecutorMutation;
