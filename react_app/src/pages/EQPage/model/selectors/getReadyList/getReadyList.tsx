import {StateSchema} from "app/providers/StoreProvider";

export const getReadyList = (state: StateSchema) => state.eq?.ready_list