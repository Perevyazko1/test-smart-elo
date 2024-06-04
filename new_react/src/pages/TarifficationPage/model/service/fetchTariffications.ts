import {createAsyncThunk} from "@reduxjs/toolkit";

import {ThunkConfig} from "@app";
import {errorApiHandler} from "@shared/api";
import {ApiList} from "@shared/types";

import {PageListItem} from "../types";

interface fetchTarifficationsProps {
    limit: number,
    offset: number,
    isNext: boolean,
}


export const fetchTariffications = createAsyncThunk<ApiList<PageListItem>, fetchTarifficationsProps, ThunkConfig<string>>(
    'tariffication/fetchTariffications',
    async (params: fetchTarifficationsProps, thunkAPI) => {
        const {extra} = thunkAPI;

        try {
            const response = await extra.api.get<ApiList<PageListItem>>('/core/tariffication/tariffication_list/', {
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