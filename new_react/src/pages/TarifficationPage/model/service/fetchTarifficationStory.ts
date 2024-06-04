import {createAsyncThunk} from "@reduxjs/toolkit";

import {ThunkConfig} from "@app";
import {errorApiHandler} from "@shared/api";

import {Tariff} from "../types";

interface fetchTarifficationStoryProps {
    production_step__id: number,
}


export const fetchTarifficationStory = createAsyncThunk<Tariff[], fetchTarifficationStoryProps, ThunkConfig<string>>(
    'tariffication/fetchTarifficationStory',
    async (params: fetchTarifficationStoryProps, thunkAPI) => {
        const {extra} = thunkAPI;

        try {
            const response = await extra.api.get<Tariff[]>(
                '/core/tariffication/get_tariffication_history/',
                {
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