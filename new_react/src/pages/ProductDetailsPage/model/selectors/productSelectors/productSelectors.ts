import {StateSchema} from "@app";

export const getCurrentProduct = (state: StateSchema) => state.productDetails?.product || null;
export const getPageIsLoading = (state: StateSchema) => state.productDetails?.isLoading;
export const getPageHasUpdated = (state: StateSchema) => state.productDetails?.hasUpdated;
