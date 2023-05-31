import {createAsyncThunk} from "@reduxjs/toolkit";
import axios from "axios";

import {SERVER_HTTP_ADDRESS} from "shared/const/server_config";

import {TaxControlData} from "../../types/TaxControlSchema";
import {taxControlActions} from "../../slice/taxControlPageSlice";


interface fetchTCFiltersProps {
}

export const fetchTCFilters = createAsyncThunk<TaxControlData, fetchTCFiltersProps, {rejectValue: string}>(
    'eq/fetchTCFilters',
    async (filters: fetchTCFiltersProps, thunkAPI) => {
        try {
            const response = await axios.get(`${SERVER_HTTP_ADDRESS}/api/v1/core/get_tariff_page_filters/`, {
                params: {...filters}
            });
            if (response.data) {
                thunkAPI.dispatch(taxControlActions.setViewModes(response.data.view_modes))
                return response.data;
            } else {
                throw new Error();
            }
        } catch (e) {
            // TODO написать обработку ошибок на различные статус коды ответа сервера
            return thunkAPI.rejectWithValue('Ошибка запроса')
        }
    }
)