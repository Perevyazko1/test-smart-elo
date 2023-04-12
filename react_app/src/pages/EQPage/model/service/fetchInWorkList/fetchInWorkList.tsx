import {createAsyncThunk} from "@reduxjs/toolkit";
import axios from "axios";

import {SERVER_HTTP_ADDRESS} from "shared/const/server_config";
import {order_product_list} from "entities/OrderProduct";

import {eqActions} from "../../slice/eqSlice";

interface fetchInWorkListProps {
    department_number: number,
    pin_code: number,
    project: string,
    view_mode: string,
    series_size: number,
}

export const fetchInWorkList = createAsyncThunk<order_product_list, fetchInWorkListProps, {rejectValue: string}>(
    'eq/fetchInWorkList',
    async (filters: fetchInWorkListProps, thunkAPI) => {
        try {
            const response = await axios.get(`${SERVER_HTTP_ADDRESS}/api/v1/core/get_in_work_list/`, {
                params: {...filters}
            });
            if (response.data) {
                thunkAPI.dispatch(eqActions.setInWorkList(response.data))
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