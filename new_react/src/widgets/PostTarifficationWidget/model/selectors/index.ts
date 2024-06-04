import {StateSchema} from "@app";

export const getPostTarifficationData = (state: StateSchema) => state.postTariffication?.data;

export const getPostTarifficationIsLoading = (state: StateSchema) => state.postTariffication?.isLoading;

export const getPostTarifficationHasUpdated = (state: StateSchema) => state.postTariffication?.hasUpdated;

