import {rtkAPI} from "@shared/api";
import {Assignment} from "@entities/Assignment";

interface AssignmentInfoApiProps {
    department__name: string,
    order_product__series_id: string,
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
        }),
    }),
});

export const useGetAssignmentInfo = AssignmentInfoApi.useGetAssignmentsInfoQuery;
