import {createAsyncThunk} from "@reduxjs/toolkit";
import axios from "axios";

import {SERVER_HTTP_ADDRESS} from "shared/const/server_config";
import {TaxControlData} from "../../types/TaxControlSchema";
import {taxControlActions} from "../../slice/taxControlPageSlice";


interface fetchTaxControlProps {
    pin_code: number,
    department_number: number,
    view_mode: string,
    product_name: string,
}

export const fetchTaxControlList = createAsyncThunk<TaxControlData, fetchTaxControlProps, {rejectValue: string}>(
    'eq/fetchTaxControlList',
    async (filters: fetchTaxControlProps, thunkAPI) => {
        try {
            const response = await axios.get(`${SERVER_HTTP_ADDRESS}/api/v1/core/get_production_step_list/`, {
                params: {...filters}
            });
            if (response.data) {
                thunkAPI.dispatch(taxControlActions.setTaxControlData(response.data.data))
                return response.data.data;
            } else {
                throw new Error();
            }
        } catch (e) {
            // TODO написать обработку ошибок на различные статус коды ответа сервера
            console.log(e)
            return thunkAPI.rejectWithValue('Ошибка запроса')
        }
    }
)