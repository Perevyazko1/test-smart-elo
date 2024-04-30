import {createAsyncThunk} from "@reduxjs/toolkit";

import {ThunkConfig} from "@app";
import {errorApiHandler} from "@shared/api";

import { OrderProduct } from "../types";

interface fetchAddCommentProps {
    series_id: string,
    comment: string,
}

export const fetchAddComment = createAsyncThunk<OrderProduct, fetchAddCommentProps, ThunkConfig<string>>(
    'orderDetail/fetchAddComment',
    async (params: fetchAddCommentProps, thunkAPI) => {
        const {extra} = thunkAPI;
        const {...extraData} = params;
        const url = '/core/add_comment/'
        try {
            const response = await extra.api.post<OrderProduct>(url, {
                    ...extraData,
                }
            );
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