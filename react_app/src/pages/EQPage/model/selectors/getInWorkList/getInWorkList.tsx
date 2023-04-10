import {StateSchema} from "app/providers/StoreProvider";

export const getInWorkList = (state: StateSchema) => state.eq?.in_work_list