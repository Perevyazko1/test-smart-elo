import {createAsyncThunk} from "@reduxjs/toolkit";
import {order_product_list} from "entities/OrderProduct";
import {ThunkConfig} from "app/providers/StoreProvider";

interface fetchNextAwaitListProps {
    url: string,
}


export const fetchNextAwaitList = createAsyncThunk<order_product_list, fetchNextAwaitListProps, ThunkConfig<string>>(
    'eq/fetchNextAwaitList',
    async (params: fetchNextAwaitListProps, thunkAPI) => {
        const {extra} = thunkAPI;

        try {
            const response = await extra.api.get<order_product_list>(params.url);
            if (response.data) {
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