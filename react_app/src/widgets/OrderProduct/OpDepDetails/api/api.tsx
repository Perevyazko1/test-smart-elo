import {rtkAPI} from "shared/api/rtkAPI";

import {ResponseDepInfo} from "../types/types";

const OpDepDetailsApi = rtkAPI.injectEndpoints({
    endpoints: (build) => ({
        getDepDetails: build.query<ResponseDepInfo, { series_id: string, department_number: number | undefined }>({
            query: (props: {series_id: string, department_number: number | undefined }) => ({
                url: '/core/get_op_dep_info',
                params: {
                    series_id: props.series_id,
                    department_number: props.department_number,
                }
            }),
        }),
    }),
});

export const useDepDetails = OpDepDetailsApi.useGetDepDetailsQuery;