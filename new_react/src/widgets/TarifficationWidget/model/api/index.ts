import {TariffPageCard} from "@pages/TariffPage";

import {rtkAPI} from "@shared/api";

interface GetTariffCardProps {
    product__id: number;
    department__id: number;
}

interface SetProductTariffProps {
    action: "proposed" | "confirm";
    product_id: number;
    department_id: number;
    tariff_id?: number;
    tariff_sum: number;
}


const TariffWidgetApi = rtkAPI.injectEndpoints({
            endpoints: (build) => ({
                getTariffCard: build.query<TariffPageCard, GetTariffCardProps>({
                    query: (props: GetTariffCardProps) => ({
                        url: '/core/tariff_widget/get_card/',
                        params: props,
                    }),
                    providesTags: (result) => [{ type: 'RetarifficationCard', id: 'ALL' }],
                }),
                setProductTariff: build.mutation<any, SetProductTariffProps>({
                    query: (props: SetProductTariffProps) => ({
                        url: '/core/tariff_widget/set_card/',
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
export const useSetTariffCard = TariffWidgetApi.useSetProductTariffMutation;
