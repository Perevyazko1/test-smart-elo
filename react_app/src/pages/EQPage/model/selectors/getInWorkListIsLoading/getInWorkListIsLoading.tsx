import {StateSchema} from "app/providers/StoreProvider";

export const getInWorkListIsLoading = (state: StateSchema) => state.eq?.in_work_list_is_loading