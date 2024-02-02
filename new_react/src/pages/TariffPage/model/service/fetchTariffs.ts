import {createAsyncThunk} from "@reduxjs/toolkit";

import {ThunkConfig} from "@app";

import {TariffPageCardList} from "../types/types";

interface fetchTariffsProps {
    limit: number,
    offset: number,
    isNext: boolean,
}


export const fetchTariffs = createAsyncThunk<TariffPageCardList, fetchTariffsProps, ThunkConfig<string>>(
    'tariff/fetchTariffs',
    async (params: fetchTariffsProps, thunkAPI) => {
        const {extra} = thunkAPI;

        try {
            const response = await extra.api.get<TariffPageCardList>(`core/tariff_cards/`, {
                params: {
                    ...params,
                },
            });
            if (response.data) {
                return response.data;
            } else {
                throw new Error();
            }
        } catch (e: any) {
            console.error('Ошибка запроса к серверу: ', e);
            return thunkAPI.rejectWithValue('Ошибка связи с сервером');
        }
    }
)