import {createAsyncThunk} from "@reduxjs/toolkit";
import axios from "axios";

import {SERVER_HTTP_ADDRESS} from "shared/const/server_config";
import {order_product} from "entities/OrderProduct";

import {eqActions} from "../../slice/eqSlice";

export enum StatusList {
    AWAIT_LIST = 'await,in_work',
    IN_WORK_LIST = 'in_work',
    READY_LIST = 'ready',
}

interface fetchEqOrderProductListProps {
    status_list: StatusList,
    department_number: number | undefined,

}

export const fetchEqOrderProductList = createAsyncThunk<order_product[], fetchEqOrderProductListProps, {rejectValue: string}>(
    'eq/fetchEqOrderProductList',
    async (filters: fetchEqOrderProductListProps, thunkAPI) => {
        try {
            const response = await axios.get(`${SERVER_HTTP_ADDRESS}/api/v1/core/eq_cards/`, {
                params: {
                    department_number: filters.department_number,
                    status_list: filters.status_list,
                }
            });
            if (response.data) {
                switch (filters.status_list) {
                    case StatusList.AWAIT_LIST:
                        thunkAPI.dispatch(eqActions.setAwaitList(response.data))
                        break
                    case StatusList.IN_WORK_LIST:
                        thunkAPI.dispatch(eqActions.setInWorkList(response.data))
                        break
                    case StatusList.READY_LIST:
                        thunkAPI.dispatch(eqActions.setReadyList(response.data))
                        break
                    default:
                        throw new Error();
                }
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