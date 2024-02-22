import {TechProcess, TechProcessSchema} from "@entities/TechProcess";
import {rtkAPI} from "@shared/api";

interface TechProcessInfoApiProps {
    product_id: number,
    pin_code: number,
    schema: TechProcessSchema,
}

const TechProcessInfoApi = rtkAPI.injectEndpoints({
    endpoints: (build) => ({
        postTechProcess: build.mutation<any, TechProcessInfoApiProps>({
            query: (props: TechProcessInfoApiProps) => ({
                url: '/core/set_tech_process/',
                method: 'POST',
                body: {
                    ...props
                }
            }),
        }),
    }),
});

export const useTechProcessMutation = TechProcessInfoApi.usePostTechProcessMutation;


export interface ResponseTechProcess {
    tech_processes: TechProcess[];
}

const TechProcessListApi = rtkAPI.injectEndpoints({
    endpoints: (build) => ({
        getTechProcesses: build.query<ResponseTechProcess, null>({
            query: () => ({
                url: '/core/get_tech_processes',
            }),
        }),
    }),
});

export const useTechProcessList = TechProcessListApi.useGetTechProcessesQuery;
