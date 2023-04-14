import {createAsyncThunk} from "@reduxjs/toolkit";
import axios from "axios";

import {SERVER_HTTP_ADDRESS} from "shared/const/server_config";
import {order_product_list} from "entities/OrderProduct";

import {orderProductInfoActions} from "../../slice/OrderProductInfoSlice";


interface fetchSetTechProcessProps {
    series_id: string,
    tech_process_id: number,
}

export const fetchSetTechProcess = createAsyncThunk<order_product_list, fetchSetTechProcessProps, {rejectValue: string}>(
    'eq/fetchTechProcesses',
    async (filters: fetchSetTechProcessProps, thunkAPI) => {
        try {
            const response = await axios.post(`${SERVER_HTTP_ADDRESS}/api/v1/core/set_tech_process/`, {
                ...filters
            });
            if (response.data) {
                thunkAPI.dispatch(orderProductInfoActions.setCurrentTechProcess(response.data.data))
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