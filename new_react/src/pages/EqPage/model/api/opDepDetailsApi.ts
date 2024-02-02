import {rtkAPI} from "@shared/api";
import {ResponseDepInfo} from "../types/departmentInfo";

interface OpDepDetailsApiProps {
    series_id: string,
    department_number: number | undefined,
}

const OpDepDetailsApi = rtkAPI.injectEndpoints({
    endpoints: (build) => ({
        getDepDetails: build.query<ResponseDepInfo, OpDepDetailsApiProps>({
            query: (props: OpDepDetailsApiProps) => ({
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