import {StateSchema} from "app/providers/StoreProvider";

export const eqAwaitListIsLoading = (state: StateSchema) => state.eqAwaitList?.is_loading;
