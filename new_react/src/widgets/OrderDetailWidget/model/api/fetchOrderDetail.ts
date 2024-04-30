import {createAsyncThunk} from "@reduxjs/toolkit";

import {ThunkConfig} from "@app";
import {errorApiHandler} from "@shared/api";

import { OrderDetails } from "../types";

interface fetchOrderDetailsProps {
    order_id: number,
}

export const fetchOrderDetail = createAsyncThunk<OrderDetails, fetchOrderDetailsProps, ThunkConfig<string>>(
    'orderDetail/fetchOrderDetails',
    async (params: fetchOrderDetailsProps, thunkAPI) => {
        const {extra} = thunkAPI;
        const {order_id, ...extraData} = params;
        try {
            const response = await extra.api.get<OrderDetails>(`/core/orders/${order_id}`, {
                params: {
                    ...extraData,
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