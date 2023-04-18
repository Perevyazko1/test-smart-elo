import {StateSchema} from "app/providers/StoreProvider";

export const getReadyListUpdated = (state: StateSchema) => state.eq?.ready_list_updated