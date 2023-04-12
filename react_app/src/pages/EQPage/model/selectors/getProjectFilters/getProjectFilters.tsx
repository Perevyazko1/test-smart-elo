import {StateSchema} from "app/providers/StoreProvider";

export const getProjectFilters = (state: StateSchema) => state.eq?.project_filters