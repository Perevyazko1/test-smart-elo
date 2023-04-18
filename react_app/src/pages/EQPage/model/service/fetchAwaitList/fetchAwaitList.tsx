import {createAsyncThunk} from "@reduxjs/toolkit";
import axios from "axios";

import {SERVER_HTTP_ADDRESS} from "shared/const/server_config";
import {order_product_list} from "entities/OrderProduct";

import {eqActions} from "../../slice/eqSlice";

interface fetchAwaitListProps {
    department_number: number,
    pin_code: number,
    project: string,
    view_mode: number,
}

export const fetchAwaitList = createAsyncThunk<order_product_list, fetchAwaitListProps, {rejectValue: string}>(
    'eq/fetchAwaitList',
    async (filters: fetchAwaitListProps, thunkAPI) => {
        try {
            const response = await axios.get(`${SERVER_HTTP_ADDRESS}/api/v1/core/get_await_list/`, {
                params: {...filters}
            });
            if (response.data) {
                thunkAPI.dispatch(eqActions.setAwaitList(response.data))
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