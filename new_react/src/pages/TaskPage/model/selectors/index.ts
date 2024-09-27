import {StateSchema} from "@app";

export const getAwaitData = (state: StateSchema) => {
    return state.taskPage?.await;
}

export const getInWorkData = (state: StateSchema) => {
    return state.taskPage?.inWork;
}

export const getReadyData = (state: StateSchema) => {
    return state.taskPage?.ready;
}

export const getNoRelevantId = (state: StateSchema) => {
    return state.taskPage?.noRelevantIds;
}

export const getViewModeInited = (state: StateSchema) => {
    return state.taskPage?.viewModeInited;
}

export const getSortModeInited = (state: StateSchema) => {
    return state.taskPage?.sortModeInited;
}

export const getStateDateRangeData = (state: StateSchema) => {
    return state.taskPage?.date_range_data;
}


export const allFiltersInited = (state: StateSchema) => {
    return state.taskPage?.sortModeInited && state.taskPage.viewModeInited;
}
