import {rtkAPI} from "@shared/api";
import {IPlanInfo} from "@pages/EqPage/model/types";

interface PlanInfoApiProps {
    days_count: number,
}

const PlanInfoApi = rtkAPI.injectEndpoints({
    endpoints: (build) => ({
        getPlanInfo: build.query<{ data: IPlanInfo }, PlanInfoApiProps>({
            query: (props: PlanInfoApiProps) => ({
                url: '/core/get_plan_info',
                params: {
                    days_count: props.days_count,
                }
            }),
            providesTags: () => ['PlanInfo'],
        }),
    }),
});

export const usePlanInfo = PlanInfoApi.useGetPlanInfoQuery;