import {StateSchema} from "@app";

export const getEqProjects = (state: StateSchema) => state.eqPage?.projects;
export const getEqViewMode = (state: StateSchema) => state.eqPage?.viewModes;
export const getWeekData = (state: StateSchema) => state.eqPage?.weekData;

export const eqFiltersInited = (state: StateSchema) => {
    return state.eqPage?.filtersInited;
}

export const eqFiltersReady = (state: StateSchema) => {
    return state.eqPage?.filtersReady;
}