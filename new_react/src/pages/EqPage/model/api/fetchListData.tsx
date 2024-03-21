import {createAsyncThunk} from "@reduxjs/toolkit";

import {ThunkConfig} from "@app";
import {ApiList} from "@shared/types";
import {errorApiHandler} from "@shared/api";

import {EqCardType} from "../types/eqCardType";
import {ListTypes} from "../consts/listTypes";


interface fetchListDataProps {
    target_list: ListTypes,
    department_number: number,
    reqId: number,
    limit?: number,
    offset?: number,
}


export const fetchListData = createAsyncThunk<ApiList<EqCardType>, fetchListDataProps, ThunkConfig<string>>(
    'eq/fetchListData',
    async (params: fetchListDataProps, thunkAPI) => {
        const {extra} = thunkAPI;

        params.target_list === 'await' && console.log('FETCH_PROPS: ', params)

        try {
            const response = await extra.api.get<ApiList<EqCardType>>('/core/get_eq_cards/', {
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