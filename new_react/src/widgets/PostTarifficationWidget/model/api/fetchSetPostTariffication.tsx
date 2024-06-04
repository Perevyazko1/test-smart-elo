import {createAsyncThunk} from "@reduxjs/toolkit";

import {ThunkConfig} from "@app";
import {errorApiHandler} from "@shared/api";

import {PostTarifficationData} from "../types";


interface fetchSetPostTarifficationProps {
    production_step__id: number;
    tariff__id: number;
    target__ids: number[];
    zero_tariff__ids: number[];
}

export const fetchSetPostTariffication = createAsyncThunk<PostTarifficationData, fetchSetPostTarifficationProps, ThunkConfig<string>>(
    'postTariffication/fetchSetPostTariffication',
    async (params: fetchSetPostTarifficationProps, thunkAPI) => {
        const {extra} = thunkAPI;

        try {
            const response = await extra.api.post<PostTarifficationData>('/core/tariffication/set_post_tariffication/', {
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