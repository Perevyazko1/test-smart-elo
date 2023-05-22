import {StateSchema} from "app/providers/StoreProvider";
import {initialState} from "../../slice/eqSlice"

export const getFiltersIsDefault = (state: StateSchema) => {
    return state.eq?.series_size === initialState.series_size &&
        state.eq?.current_project === initialState.current_project &&
        state.eq?.current_view_mode === initialState.current_view_mode;
}