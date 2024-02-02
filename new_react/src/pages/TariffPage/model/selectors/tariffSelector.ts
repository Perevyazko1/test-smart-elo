import {StateSchema} from "@app";

import {tariffPageCardAdapter, TariffPageSchema} from "../types/types";


export const getTariffList = tariffPageCardAdapter.getSelectors<StateSchema>(
    state => state.tariffs?.results || tariffPageCardAdapter.getInitialState()
);

export const getTariffProps = (state: StateSchema): Omit<TariffPageSchema, 'results'> => {
    return {
        next: state.tariffs?.next || null,
        previous: state.tariffs?.previous || null,
        count: state.tariffs?.count || 0,
        isLoading: state.tariffs?.isLoading !== undefined ? state.tariffs?.isLoading : true,
        hasUpdated: state.tariffs?.hasUpdated,
    };
};