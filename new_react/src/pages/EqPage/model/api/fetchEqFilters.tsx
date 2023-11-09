import {createAsyncThunk} from "@reduxjs/toolkit";
import {ThunkConfig} from "@app";
import {ViewMode} from "../types/viewMode";

type fetchEqFiltersProps = {
    department_number: number,
}

interface EqFilters {
    mode: string | undefined;
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
                }
            });
            if (response.data) {
                return response.data;
            } else {
                throw new Error();
            }
        } catch (e: any) {
            console.log(e);
            return thunkAPI.rejectWithValue('Ошибка связи с сервером');
        }
    }
)