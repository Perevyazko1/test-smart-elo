import {createAsyncThunk} from "@reduxjs/toolkit";
import axios from "axios";

import {SERVER_HTTP_ADDRESS} from "shared/const/server_config";

import {orderProductInfoActions} from "../../slice/OrderProductInfoSlice";
import {order_product_tables_data} from "../../type/OrderProductInfoSchema";


interface fetchOPTablesDataProps {
    series_id: string,
    department_number: number,
}

export const fetchOPTablesData = createAsyncThunk<order_product_tables_data, fetchOPTablesDataProps, {rejectValue: string}>(
    'eq/fetchOPTablesData',
    async (filters: fetchOPTablesDataProps, thunkAPI) => {
        try {
            const response = await axios.get(`${SERVER_HTTP_ADDRESS}/api/v1/core/get_order_product_info/`, {
                params: filters
            });
            if (response.data) {
                thunkAPI.dispatch(orderProductInfoActions.setOPTablesData(response.data))
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