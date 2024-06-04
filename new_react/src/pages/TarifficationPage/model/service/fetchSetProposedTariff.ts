import {createAsyncThunk} from "@reduxjs/toolkit";

import {ThunkConfig} from "@app";
import {errorApiHandler} from "@shared/api";

interface SetProposedTariffProps {
    production_step__id: number;
    amount: number;
}


export const fetchSetProposedTariff = createAsyncThunk<string, SetProposedTariffProps, ThunkConfig<string>>(
    'tariffication/fetchSetProposedTariff',
    async (params: SetProposedTariffProps, thunkAPI) => {
        const {extra} = thunkAPI;

        try {
            const response = await extra.api.post<string>('/core/tariffication/set_proposed_tariff/', {
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
