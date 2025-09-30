import {rtkAPI} from "@shared/api";

interface ISetTiming {
    ps_id: number;
    timing: number;
}

interface IPrintLabels {
    assignment_ids: number[];
    is_admin: boolean;
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
        printLabels: build.query<any, IPrintLabels>({
            query: (props: IPrintLabels) => ({
                url: '/core/print_labels/',
                method: 'GET',
                params: props,
            }),
        }),
        printFabric: build.query<any, {fabric_id: number}>({
            query: (props: {fabric_id: number}) => ({
                url: '/core/print_fabric/',
                method: 'GET',
                params: props,
            }),
        }),
    }),

});

export const useSetTiming = EqCardApi.useEditTimingMutation;
export const useLazyPrintLabels = EqCardApi.useLazyPrintLabelsQuery;
export const useLazyPrintFabric = EqCardApi.useLazyPrintFabricQuery;
