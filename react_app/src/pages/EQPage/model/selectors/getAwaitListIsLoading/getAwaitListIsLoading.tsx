import {StateSchema} from "app/providers/StoreProvider";

export const getAwaitListIsLoading = (state: StateSchema) => state.eq?.await_list_is_loading