import {StateSchema} from "app/providers/StoreProvider";

export const getCurrentViewMod = (state: StateSchema) => state.eq?.current_view_mode || {name: "Личные наряды", key: 0}