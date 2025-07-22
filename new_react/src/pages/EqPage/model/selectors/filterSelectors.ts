import {StateSchema} from "@app";

export const getEqProjects = (state: StateSchema) => state.eqPage?.projects;
export const getEqViewMode = (state: StateSchema) => state.eqPage?.viewModes;
export const getWeekData = (state: StateSchema) => state.eqPage?.weekData;

export const eqFiltersReady = (state: StateSchema) => {
    return state.eqPage?.projects.inited && state.eqPage?.viewModes.inited;
}