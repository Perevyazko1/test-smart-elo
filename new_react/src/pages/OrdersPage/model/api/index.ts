import {createAsyncThunk} from "@reduxjs/toolkit";

import {ThunkConfig} from "@app";
import {errorApiHandler} from "@shared/api";

import {OrdersListApi} from "../types";


interface fetchOrdersProps {
    limit: number,
    offset: number,
    isNext: boolean,
}

export const fetchOrders = createAsyncThunk<OrdersListApi, fetchOrdersProps, ThunkConfig<string>>(
    'orders/fetchOrders',
    async (params: fetchOrdersProps, thunkAPI) => {
        const {extra} = thunkAPI;
        try {
            const response = await extra.api.get<OrdersListApi>('/core/orders', {
                params: {
                    ...params,
                }
            });
            if (response.data) {
                return response.data;
            } else {
                throw new Error();
            }
        } catch (e: any) {
            errorApiHandler(e);
            return thunkAPI.rejectWithValue('Ошибка связи с сервером');
        }
    }
)


