import {StateSchema} from "app/providers/StoreProvider";

export const getEqPageIsLoading = (state: StateSchema) => state.eqPage?.is_loading || true;
export const getEqPageHasUpdated = (state: StateSchema) => state.eqPage?.has_updated;
export const getEqPageNotRelevantId = (state: StateSchema) => state.eqPage?.not_relevant_id || [];
export const getEqPageNextUrl = (state: StateSchema) => state.eqPage?.next || null;
export const getEqPagePreviousUrl = (state: StateSchema) => state.eqPage?.previous || null;
export const getEqPageCount = (state: StateSchema) => state.eqPage?.count || 0;