import {StateSchema} from "app/providers/StoreProvider";

export const getReadyData = (state: StateSchema) => state.eq?.ready_data