import {createAsyncThunk} from "@reduxjs/toolkit";

import {ThunkConfig} from "@app";
import {ApiList} from "@shared/types";

import {EqCardType} from "../types/eqCardType";
import {ListTypes} from "../consts/listTypes";


interface fetchListDataProps {
    target_list: ListTypes,
    limit?: number,
    offset?: number,
    url?: string,
}


export const fetchListData = createAsyncThunk<ApiList<EqCardType>, fetchListDataProps, ThunkConfig<string>>(
    'eq/fetchListData',
    async (params: fetchListDataProps, thunkAPI) => {
        const {extra} = thunkAPI;

        const {url, ...props} = params;

        try {
            let response

            if (url) {
                response = await extra.api.get<ApiList<EqCardType>>(url);
            } else {
                response = await extra.api.get<ApiList<EqCardType>>('/core/get_eq_cards/', {
                    params: {
                        ...props,
                    }
                });
            }
            if (response.data) {
                return response.data;
            } else {
                throw new Error();
            }
        } catch (e: any) {
            console.log(e);
            return thunkAPI.rejectWithValue('Ошибка связи с сервером');
        }
    }
)