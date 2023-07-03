import {rtkAPI} from "shared/api/rtkAPI";

import {ResponseTechProcess} from "../types/types";

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