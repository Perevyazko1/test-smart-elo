import {createAsyncThunk} from "@reduxjs/toolkit";

import {ThunkConfig} from "@app";
import {errorApiHandler} from "@shared/api";

import {ViewMode} from "../types/viewMode";

type fetchEqFiltersProps = {
    department_id: number,
    project_mode: string | undefined;
}

interface EqFilters {
    view_modes: ViewMode[];
    project_filters: string[];
}

export const fetchEqFilters = createAsyncThunk<EqFilters, fetchEqFiltersProps, ThunkConfig<string>>(
    'eq/fetchEqFilters',
    async (params: fetchEqFiltersProps, thunkAPI) => {
        const {extra} = thunkAPI;

        try {
            const response = await extra.api.get<EqFilters>('/core/get_eq_filters/', {
                params: {
                    ...params,
                },
            });
            if (response.data) {
                return response.data;
            } else {
                throw new Error();
            }
        } catch (e: any) {
            errorApiHandler(e);
            return thunkAPI.rejectWithValue('Ошибка связи с сервером');
        }
    }
)