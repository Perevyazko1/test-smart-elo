import {StateSchema} from "app/providers/StoreProvider";

import {tariffPageCardAdapter, TariffPageSchema} from "../types/types";

export const getTariffList = tariffPageCardAdapter.getSelectors<StateSchema>(
    state => state.tariff?.results || tariffPageCardAdapter.getInitialState()
);

export const getTariffProps = (state: StateSchema): Omit<TariffPageSchema, 'results'> => {
    return {
        next: state.tariff?.next || null,
        previous: state.tariff?.previous || null,
        count: state.tariff?.count || 0,
        isLoading: state.tariff?.isLoading !== undefined ? state.tariff?.isLoading : true,
        hasUpdated: state.tariff?.hasUpdated,
    };
};