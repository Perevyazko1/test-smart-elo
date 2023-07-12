import {StateSchema} from "app/providers/StoreProvider";

export const getEqProjectFilter = (state: StateSchema) => state.eqFilters?.projectFilter;
export const getViewModeFilter = (state: StateSchema) => state.eqFilters?.viewModeFilter;
export const getWeekData = (state: StateSchema) => state.eqFilters?.weekData;
export const getSeriesSize = (state: StateSchema) => state.eqFilters?.seriesSize || 1;
export const getNoRelevantId = (state: StateSchema) => state.eqFilters?.notRelevantId || [];
export const listsHasUpdated = (state: StateSchema) => state.eqFilters?.listsHasUpdated || false;
