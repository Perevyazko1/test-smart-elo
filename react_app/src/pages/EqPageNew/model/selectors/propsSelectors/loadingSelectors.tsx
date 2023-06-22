import {StateSchema} from "app/providers/StoreProvider";

export const getEqAwaitIsLoading = (state: StateSchema) => state.eqDesktop?.awaitList.isLoading || false;
export const getEqInWorkIsLoading = (state: StateSchema) => state.eqDesktop?.inWorkList.isLoading || false;
export const getEqReadyIsLoading = (state: StateSchema) => state.eqDesktop?.readyList.isLoading || false;

export const getEqAwaitHasUpdated = (state: StateSchema) => state.eqDesktop?.awaitList.hasUpdated;
export const getEqInWorkHasUpdated = (state: StateSchema) => state.eqDesktop?.inWorkList.hasUpdated;
export const getEqReadyHasUpdated = (state: StateSchema) => state.eqDesktop?.readyList.hasUpdated;

export const getEqAwaitNotRelevantIds = (state: StateSchema) => state.eqDesktop?.awaitList.notRelevantId;
export const getEqInWorkNotRelevantIds = (state: StateSchema) => state.eqDesktop?.inWorkList.notRelevantId;
export const getEqReadyNotRelevantIds = (state: StateSchema) => state.eqDesktop?.readyList.notRelevantId;

export const getEqAwaitPageInfo = (state: StateSchema) => {
    return {
        next: state.eqDesktop?.awaitList.next || null,
        previous: state.eqDesktop?.awaitList.previous || null,
        count: state.eqDesktop?.awaitList.count || 0,
    }
};

export const getEqInWorkPageInfo = (state: StateSchema) => {
    return {
        next: state.eqDesktop?.inWorkList.next || null,
        previous: state.eqDesktop?.inWorkList.previous || null,
        count: state.eqDesktop?.inWorkList.count || 0,
    }
};

export const getEqReadyPageInfo = (state: StateSchema) => {
    return {
        next: state.eqDesktop?.readyList.next || null,
        previous: state.eqDesktop?.readyList.previous || null,
        count: state.eqDesktop?.readyList.count || 0,
    }
};
