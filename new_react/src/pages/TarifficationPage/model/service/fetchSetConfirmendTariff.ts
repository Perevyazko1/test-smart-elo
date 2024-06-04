import {createAsyncThunk} from "@reduxjs/toolkit";

import {ThunkConfig} from "@app";
import {errorApiHandler} from "@shared/api";

interface SetConfirmedTariffProps {
    production_step__id: number;
    tariff__id: number;
}


export const fetchSetConfirmedTariff = createAsyncThunk<string, SetConfirmedTariffProps, ThunkConfig<string>>(
    'tariffication/fetchSetConfirmedTariff',
    async (params: SetConfirmedTariffProps, thunkAPI) => {
        const {extra} = thunkAPI;

        try {
            const response = await extra.api.post<string>('/core/tariffication/set_confirmed_tariff/', {
                ...params,
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
