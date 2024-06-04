import {createAsyncThunk} from "@reduxjs/toolkit";

import {ThunkConfig} from "@app";
import {errorApiHandler} from "@shared/api";

import {PageListItem} from "../types";

interface fetchTarifficationProps {
    itemId: number,
}


export const fetchTariffication = createAsyncThunk<PageListItem, fetchTarifficationProps, ThunkConfig<string>>(
    'tariffication/fetchTariffication',
    async (params: fetchTarifficationProps, thunkAPI) => {
        const {extra} = thunkAPI;
        const {itemId, ...otherProps} = params;
        const url = `/core/tariffication/tariffication_list/${itemId}/`

        try {
            const response = await extra.api.get<PageListItem>(url, {
                params: {
                    ...otherProps,
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