import {StateSchema} from "app/providers/StoreProvider";

export const getInWorkListUpdated = (state: StateSchema) => state.eq?.in_work_list_updated