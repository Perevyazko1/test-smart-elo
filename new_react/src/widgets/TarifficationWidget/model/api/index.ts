import {rtkAPI} from "@shared/api";
import {PageListItem} from "@pages/TarifficationPage";

import {NewTarifficationComment, TarifficationComment} from "../types";


interface GetPageListItemProps {
    production_step__id: number,
}

interface SetProposedTariffProps {
    production_step__id: number;
    amount: number;
}

interface SetConfirmedTariffProps {
    production_step__id: number;
    tariff__id: number;
}


const TariffWidgetApi = rtkAPI.injectEndpoints({
            endpoints: (build) => ({
                getTariffCard: build.query<PageListItem, GetPageListItemProps>({
                    query: (props: GetPageListItemProps) => ({
                        url: `/core/tariffication/tariffication_list/${props.production_step__id}`,
                    }),
                    providesTags: () => [{type: 'RetarifficationCard', id: 'ALL'}],
                }),
                setProposedTariff: build.mutation<any, SetProposedTariffProps>({
                    query: (props: SetProposedTariffProps) => ({
                        url: '/core/tariffication/set_proposed_tariff/',
                        method: 'POST',
                        data: props,
                        body: props,
                    }),
                    invalidatesTags: [
                        {type: 'RetarifficationCard', id: 'ALL'},
                        {type: 'TarifficationComments', id: 'ALL'},
                    ],
                }),
                setConfirmedTariff: build.mutation<any, SetConfirmedTariffProps>({
                    query: (props: SetConfirmedTariffProps) => ({
                        url: '/core/tariffication/set_confirmed_tariff/',
                        method: 'POST',
                        data: props,
                        body: props,
                    }),
                    invalidatesTags: [
                        {type: 'RetarifficationCard', id: 'ALL'},
                        {type: 'TarifficationComments', id: 'ALL'},
                    ],
                }),
                getTarifficationComments: build.query<TarifficationComment[], { production_step: number }>({
                    query: (props: { production_step: number }) => ({
                        url: '/core/production_step_comments/',
                        params: props,
                    }),
                    providesTags: () => [{type: 'TarifficationComments', id: 'ALL'}]
                }),
                createTarifficationComment: build.mutation<TarifficationComment, NewTarifficationComment>({
                    query: (props: NewTarifficationComment) => ({
                        url: '/core/production_step_comments/',
                        method: 'POST',
                        body: props,
                    }),
                    invalidatesTags: [
                        {type: 'TarifficationComments', id: 'ALL'},
                    ],
                }),
            }),
        }
    )
;


export const useGetTarifficationComments = TariffWidgetApi.useGetTarifficationCommentsQuery;
export const useCreateTarifficationComment = TariffWidgetApi.useCreateTarifficationCommentMutation;


export const useGetTariffCard = TariffWidgetApi.useGetTariffCardQuery;
export const useSetProposedTariff = TariffWidgetApi.useSetProposedTariffMutation;
export const useSetConfirmedTariff = TariffWidgetApi.useSetConfirmedTariffMutation;
