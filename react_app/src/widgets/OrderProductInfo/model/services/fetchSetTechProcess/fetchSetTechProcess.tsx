import {createAsyncThunk} from "@reduxjs/toolkit";
import {order_product_list} from "entities/OrderProduct";
import {ThunkConfig} from "app/providers/StoreProvider";
import {getEmployeePinCode} from "../../../../../entities/Employee";


interface fetchSetTechProcessProps {
    series_id: string,
    tech_process_id: number,
}

export const fetchSetTechProcess = createAsyncThunk<order_product_list, fetchSetTechProcessProps, ThunkConfig<string>>(
    'eq/fetchTechProcesses',
    async (filters: fetchSetTechProcessProps, thunkAPI) => {
        const {extra, getState} = thunkAPI;

        const pin_code = getEmployeePinCode(getState())

        try {
            const response = await extra.api.post('/core/set_tech_process/', {
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