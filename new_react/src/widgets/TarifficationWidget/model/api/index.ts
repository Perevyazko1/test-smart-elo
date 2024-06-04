import {rtkAPI} from "@shared/api";
import {PageListItem} from "@pages/TarifficationPage";

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
                    providesTags: (result) => [{ type: 'RetarifficationCard', id: 'ALL' }],
                }),
                setProposedTariff: build.mutation<any, SetProposedTariffProps>({
                    query: (props: SetProposedTariffProps) => ({
                        url: '/core/tariffication/set_proposed_tariff/',
                        method: 'POST',
                        data: props,
                        body: props,
                    }),
                    invalidatesTags: [{ type: 'RetarifficationCard', id: 'ALL' }],
                }),
                setConfirmedTariff: build.mutation<any, SetConfirmedTariffProps>({
                    query: (props: SetConfirmedTariffProps) => ({
                        url: '/core/tariffication/set_confirmed_tariff/',
                        method: 'POST',
                        data: props,
                        body: props,
                    }),
                    invalidatesTags: [{ type: 'RetarifficationCard', id: 'ALL' }],
                }),
            }),
        }
    )
;

export const useGetTariffCard = TariffWidgetApi.useGetTariffCardQuery;
export const useSetProposedTariff = TariffWidgetApi.useSetProposedTariffMutation;
export const useSetConfirmedTariff = TariffWidgetApi.useSetConfirmedTariffMutation;
