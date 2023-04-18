import {StateSchema} from "app/providers/StoreProvider";

export const getAwaitListUpdated = (state: StateSchema) => state.eq?.await_list_updated