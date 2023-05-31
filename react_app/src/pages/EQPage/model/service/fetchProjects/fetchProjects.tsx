import {createAsyncThunk} from "@reduxjs/toolkit";
import axios from "axios";

import {SERVER_HTTP_ADDRESS} from "shared/const/server_config";

import {eqActions} from "../../slice/eqSlice";

interface fetchProjectFiltersProps {
    data?: string
}

export const fetchProjectFilters = createAsyncThunk<string[], fetchProjectFiltersProps, {rejectValue: string}>(
    'eq/fetchProjectFilters',
    async (filters: fetchProjectFiltersProps, thunkAPI) => {
        try {
            const response = await axios.get(`${SERVER_HTTP_ADDRESS}/api/v1/core/get_project_filters/`, {
                // params: {...filters}
            });
            if (response.data) {
                thunkAPI.dispatch(eqActions.setProjectFilters(response.data.data))
                return response.data.data;
            } else {
                throw new Error();
            }
        } catch (e) {
            // TODO написать обработку ошибок на различные статус коды ответа сервера
            return thunkAPI.rejectWithValue('Ошибка запроса')
        }
    }
)