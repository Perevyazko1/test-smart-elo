import {createAsyncThunk} from "@reduxjs/toolkit";
import axios from "axios";

import {SERVER_HTTP_ADDRESS} from "shared/const/server_config";

export enum SetTaxModes {
    ALL_UNCHARGED = 'ALL_UNCHARGED',
    EXCEPT_READY = 'EXCEPT_READY',
}

interface fetchSetTaxProps {
    product_id: number,
    tariff: number,
    mode: SetTaxModes,
    pin_code: number,
    department_number: number,
}

export const fetchSetTax = createAsyncThunk<any, fetchSetTaxProps, {rejectValue: string}>(
    'taxControl/fetchSetTax',
    async (params: fetchSetTaxProps, thunkAPI) => {
        try {
            const response = await axios.post(`${SERVER_HTTP_ADDRESS}/api/v1/core/set_production_step_tax/`, {
                ...params
            });

            if (response.data) {
                return response.data;
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