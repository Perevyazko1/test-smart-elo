import {eqCardEntityAdapter} from "../types/eqCardType";
import {StateSchema} from "@app";
import {EqListData} from "@pages/EqPage/model/types/eqPageSchema";
import {createSelector} from "@reduxjs/toolkit";

export const getNoRelevantId = (state: StateSchema) => state.eqPage?.notRelevantId;

export const getEqAwaitList = eqCardEntityAdapter.getSelectors<StateSchema>(
    state => state.eqPage?.awaitList.results || eqCardEntityAdapter.getInitialState()
);

export const getEqInWorkList = eqCardEntityAdapter.getSelectors<StateSchema>(
    state => state.eqPage?.inWorkList.results || eqCardEntityAdapter.getInitialState()
);

export const getEqReadyList = eqCardEntityAdapter.getSelectors<StateSchema>(
    state => state.eqPage?.readyList.results || eqCardEntityAdapter.getInitialState()
);

const selectAwaitList = (state: StateSchema) => state.eqPage?.awaitList;
export const getAwaitListInfo = createSelector(
    [selectAwaitList],
    (awaitList: EqListData | undefined) => {
        return {
            next: awaitList?.next,
            previous: awaitList?.previous,
            count: awaitList?.count,
            isLoading: awaitList?.isLoading,
            hasUpdated: awaitList?.hasUpdated,
        };
    }
);

const selectInWorkList = (state: StateSchema) => state.eqPage?.inWorkList;
export const getInWorkListInfo = createSelector(
    [selectInWorkList],
    (inWorkList: EqListData | undefined) => {
        return {
            next: inWorkList?.next,
            previous: inWorkList?.previous,
            count: inWorkList?.count,
            isLoading: inWorkList?.isLoading,
            hasUpdated: inWorkList?.hasUpdated,
        };
    }
);

const selectReadyList = (state: StateSchema) => state.eqPage?.readyList;
export const getReadyListInfo = createSelector(
    [selectReadyList],
    (readyList: EqListData | undefined) => {
        return {
            next: readyList?.next,
            previous: readyList?.previous,
            count: readyList?.count,
            isLoading: readyList?.isLoading,
            hasUpdated: readyList?.hasUpdated,
        };
    }
);