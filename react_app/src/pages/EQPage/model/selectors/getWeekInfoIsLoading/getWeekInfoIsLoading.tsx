import {StateSchema} from "app/providers/StoreProvider";

export const getWeekInfoIsLoading = (state: StateSchema) => state.eq?.week_info_is_loading