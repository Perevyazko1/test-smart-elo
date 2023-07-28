import {rtkAPI} from "shared/api/rtkAPI";
import {tech_process_schema} from "entities/TechnologicalProcess";

interface TechProcessInfoApiProps {
    mode: 'with_current_assignments' | 'tech_process_only',
    product_id: number,
    pin_code: number,
    schema: tech_process_schema,
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