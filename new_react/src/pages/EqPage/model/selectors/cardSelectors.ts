import {StateSchema} from "@app";

export const getNoRelevantIds = (state: StateSchema) => state.eqPage?.notRelevantIds;
