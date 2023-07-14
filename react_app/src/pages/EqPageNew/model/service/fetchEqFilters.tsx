import {createAsyncThunk} from "@reduxjs/toolkit";

import {ThunkConfig} from "app/providers/StoreProvider";
import {handleErrors} from "shared/api/handleErrors";

import {getEqProjectFilter} from "../selectors/apiSelectors/apiSelectors";
import {ViewMode} from "../types/eqPageSchema";

type fetchEqFiltersProps = {
    mode: 'all' | 'actual';
}

interface EqFilters {
    mode: 'all' | 'actual';
    view_modes: ViewMode[];
    project_filters: string[];
}

export const fetchEqFilters = createAsyncThunk<EqFilters, fetchEqFiltersProps, ThunkConfig<string>>(
    'eq/fetchEqFilters',
    async (params: fetchEqFiltersProps, thunkAPI) => {
        const {extra, getState} = thunkAPI;

        const filters = getEqProjectFilter(getState());

        try {
            const response = await extra.api.get<EqFilters>('/core/get_eq_filters/', {
                params: {
                    ...params,
                    ...filters,
                }
            });
            if (response.data) {
                return response.data;
            } else {
                throw new Error();
            }
        } catch (e: any) {
            return handleErrors(e, thunkAPI);
        }
    }
)