import {StateSchema} from "app/providers/StoreProvider";

export const getCurrentProject = (state: StateSchema) => state.eq?.current_project || "Все проекты"