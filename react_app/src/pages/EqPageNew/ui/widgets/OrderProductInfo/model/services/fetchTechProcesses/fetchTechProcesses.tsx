import {createAsyncThunk} from "@reduxjs/toolkit";
import axios from "axios";

import {SERVER_HTTP_ADDRESS} from "shared/const/server_config";
import {order_product_list} from "entities/OrderProduct";

import {orderProductInfoActions} from "../../slice/OrderProductInfoSlice";


interface fetchTechProcessesProps {
}

export const fetchTechProcesses = createAsyncThunk<order_product_list, fetchTechProcessesProps, {rejectValue: string}>(
    'eq/fetchTechProcesses',
    async (filters: fetchTechProcessesProps, thunkAPI) => {
        try {
            const response = await axios.get(`${SERVER_HTTP_ADDRESS}/api/v1/core/get_tech_process_info/`, {
                params: {...filters}
            });
            if (response.data) {
                thunkAPI.dispatch(orderProductInfoActions.setTechProcessList(response.data.data))
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