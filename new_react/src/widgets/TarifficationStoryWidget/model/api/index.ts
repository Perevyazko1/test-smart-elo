import {rtkAPI} from "@shared/api";
import {Tariff} from "@pages/TarifficationPage";


interface TarifficationStoryApiProps {
    production_step__id: number,
}


const TarifficationStoryApi = rtkAPI.injectEndpoints({
    endpoints: (build) => ({
        getTarifficationStory: build.query<Tariff[], TarifficationStoryApiProps>({
            query: (props: TarifficationStoryApiProps) => ({
                url: '/core/tariffication/get_tariffication_history/',
                method: 'GET',
                params: {
                    ...props,
                }
            }),
        }),
    }),
});

export const useGetTarifficationStory = TarifficationStoryApi.useGetTarifficationStoryQuery;
