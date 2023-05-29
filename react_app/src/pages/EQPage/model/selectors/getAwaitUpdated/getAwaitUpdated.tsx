import {StateSchema} from "app/providers/StoreProvider";

export const getAwaitUpdated = (state: StateSchema) => state.eq?.await_updated
