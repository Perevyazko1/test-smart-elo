import {eqPageCardEntityAdapter} from "entities/EqPageCard";
import {StateSchema} from "app/providers/StoreProvider";
import {EqListData} from "../../types/eqPageSchema";

export const getEqMobileList = eqPageCardEntityAdapter.getSelectors<StateSchema>(
    state => state.eqMobile?.results || eqPageCardEntityAdapter.getInitialState()
);

export const getEqMobileListInfo = (state: StateSchema): Omit<EqListData, 'results'> => {
    return {
        next: state.eqMobile?.next || null,
        previous: state.eqMobile?.previous || null,
        count: state.eqMobile?.count || 0,
        isLoading: state.eqMobile?.isLoading !== undefined ? state.eqMobile?.isLoading : true,
        hasUpdated: state.eqMobile?.hasUpdated,
    };
};