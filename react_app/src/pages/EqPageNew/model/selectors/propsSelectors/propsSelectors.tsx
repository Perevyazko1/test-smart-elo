import {StateSchema} from "app/providers/StoreProvider";
import {EqListData} from "../../types/eqPageSchema";

export const getListInfo = (state: StateSchema, listType: 'await' | 'in_work' | 'ready'): Omit<EqListData, 'results'> => {
    const targetState = listType === 'await' ? state.eqDesktop?.awaitList :
        listType === 'in_work' ? state.eqDesktop?.inWorkList : state.eqDesktop?.readyList;

    return {
        next: targetState?.next || null,
        previous: targetState?.previous || null,
        count: targetState?.count || 0,
        isLoading: targetState?.isLoading !== undefined ? targetState.isLoading : true,
        notRelevantId: targetState?.notRelevantId || [],
        hasUpdated: targetState?.hasUpdated,
    };
};
