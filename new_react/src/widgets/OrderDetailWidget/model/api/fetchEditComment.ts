import {createAsyncThunk} from "@reduxjs/toolkit";

import {ThunkConfig} from "@app";
import {errorApiHandler} from "@shared/api";

import { OrderProduct } from "../types";

interface fetchEditCommentProps {
    op_id: number,
    comment_id: string,
    action: "delete" | "-delete" | "important" | "-important",
}

export const fetchEditComment = createAsyncThunk<OrderProduct, fetchEditCommentProps, ThunkConfig<string>>(
    'orderDetail/fetchEditComment',
    async (params: fetchEditCommentProps, thunkAPI) => {
        const {extra} = thunkAPI;
        const {...extraData} = params;
        const url = '/core/edit_comment/'
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