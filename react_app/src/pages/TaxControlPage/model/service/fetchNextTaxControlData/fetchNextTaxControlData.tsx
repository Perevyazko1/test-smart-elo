import {createAsyncThunk} from "@reduxjs/toolkit";
import {ThunkConfig} from "app/providers/StoreProvider";

import {TaxControlList} from "../../types/TaxControlSchema";


interface fetchNextTaxControlProps {
    next: string,
}

export const fetchNextTaxControlData = createAsyncThunk<TaxControlList, fetchNextTaxControlProps, ThunkConfig<string>>(
    'eq/fetchNextTaxControlData',
    async (params: fetchNextTaxControlProps, thunkAPI) => {

        const {extra} = thunkAPI;

        try {
            const response = await extra.api.get<TaxControlList>(params.next);
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