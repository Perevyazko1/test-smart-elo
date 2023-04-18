import {StateSchema} from "app/providers/StoreProvider";

export const getReadyListIsLoading = (state: StateSchema) => state.eq?.ready_list_is_loading