import {StateSchema} from "@app";

export const getNavHasUpdated = (state: StateSchema) => state.appNavbar?.hasUpdated;
export const getNavIsLoading = (state: StateSchema) => state.appNavbar?.isLoading;
export const getNavHasNotifications = (state: StateSchema) => state.appNavbar?.hasNotifications;
