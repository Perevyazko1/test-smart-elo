import {createAsyncThunk} from "@reduxjs/toolkit";

import {getEmployeePinCode} from "entities/Employee";
import {tech_process_schema} from "entities/TechnologicalProcess";
import {order_product_list} from "entities/OrderProduct";
import {ThunkConfig} from "app/providers/StoreProvider";


interface fetchSetCustomTechProcessProps {
    series_id: string,
    schema: tech_process_schema,
}

export const fetchSetCustomTechProcess = createAsyncThunk<
    order_product_list, fetchSetCustomTechProcessProps, ThunkConfig<string>>
(
    'eq/fetchSetCustomTechProcess',
    async (filters: fetchSetCustomTechProcessProps, thunkAPI) => {
        const {extra, getState} = thunkAPI;

        const pin_code = getEmployeePinCode(getState())

        try {
            const response = await extra.api.post('/core/set_custom_tech_process/', {
                pin_code: pin_code,
                ...filters
            });
            if (response.data) {
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