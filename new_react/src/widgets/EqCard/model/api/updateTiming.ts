import {rtkAPI} from "@shared/api";

interface ISetTiming {
    ps_id: number;
    timing: number;
}


const EqCardApi = rtkAPI.injectEndpoints({
    endpoints: (build) => ({
        editTiming: build.mutation<any, ISetTiming>({
            query: (props: ISetTiming) => ({
                url: '/core/update_timing_info/',
                method: 'POST',
                body: props,
            }),
            invalidatesTags: [
                {type: 'PlanInfo'},
            ],
        }),
    }),
});

export const useSetTiming = EqCardApi.useEditTimingMutation;
