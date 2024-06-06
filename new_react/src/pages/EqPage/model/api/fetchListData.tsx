import {createAsyncThunk} from "@reduxjs/toolkit";

import {ThunkConfig} from "@app";
import {ApiList} from "@shared/types";
import {errorApiHandler} from "@shared/api";

import {ListTypes} from "../consts/listTypes";
import {EqOrderProduct} from "@pages/EqPage/model/types";


interface fetchListDataProps {
    target_list: ListTypes,
    department_id: number,
    reqId: number,
    limit?: number,
    offset?: number,
}


export const fetchListData = createAsyncThunk<ApiList<EqOrderProduct>, fetchListDataProps, ThunkConfig<string>>(
    'eq/fetchListData',
    async (params: fetchListDataProps, thunkAPI) => {
        const {extra} = thunkAPI;

        try {
            const response = await extra.api.get<ApiList<EqOrderProduct>>('/core/get_eq_cards/', {
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