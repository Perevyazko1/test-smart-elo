import {rtkAPI} from "shared/api/rtkAPI";
import {tech_process_schema} from "entities/TechnologicalProcess";

const TechProcessInfoApi = rtkAPI.injectEndpoints({
    endpoints: (build) => ({
        postTechProcess: build.mutation<any, { series_id: string, pin_code: number, schema: tech_process_schema }>({
            query: (props: { series_id: string, pin_code: number, schema: tech_process_schema }) => ({
                url: '/core/set_tech_process/',
                method: 'POST',
                body: {
                    series_id: props.series_id,
                    pin_code: props.pin_code,
                    schema: props.schema,
                }
            }),
        }),
    }),
});

export const useTechProcessMutation = TechProcessInfoApi.usePostTechProcessMutation;