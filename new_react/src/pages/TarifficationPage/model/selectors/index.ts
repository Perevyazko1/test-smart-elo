import {StateSchema} from "@app";

export const getProjects = (state: StateSchema) => {
    return state.tarifficationPage?.projects;
}

export const getPageIsLoading = (state: StateSchema) => {
    return state.tarifficationPage?.isLoading;
}

export const getPageHasUpdated = (state: StateSchema) => {
    return state.tarifficationPage?.hasUpdated;
}

export const getPageList = (state: StateSchema) => {
    return state.tarifficationPage?.results;
}

export const getNoRelevantIds = (state: StateSchema) => {
    return state.tarifficationPage?.noRelevantIds;
}

export const getNextUrl = (state: StateSchema) => {
    return state.tarifficationPage?.next;
}