import {createAsyncThunk} from "@reduxjs/toolkit";
import axios from "axios";

import {SERVER_HTTP_ADDRESS} from "shared/const/server_config";
import {tech_process_schema} from "entities/TechnologicalProcess";
import {order_product_list} from "entities/OrderProduct";

import {orderProductInfoActions} from "../../slice/OrderProductInfoSlice";


interface fetchSetCustomTechProcessProps {
    series_id: string,
    schema: tech_process_schema,
}

export const fetchSetCustomTechProcess = createAsyncThunk<
    order_product_list, fetchSetCustomTechProcessProps, { rejectValue: string }>
(
    'eq/fetchSetCustomTechProcess',
    async (filters: fetchSetCustomTechProcessProps, thunkAPI) => {
        try {
            const response = await axios.post(`${SERVER_HTTP_ADDRESS}/api/v1/core/set_custom_tech_process/`, {
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