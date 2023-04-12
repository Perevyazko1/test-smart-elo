import {StateSchema} from "app/providers/StoreProvider";

export const getSeriesSize = (state: StateSchema) => state.eq?.series_size || 1;