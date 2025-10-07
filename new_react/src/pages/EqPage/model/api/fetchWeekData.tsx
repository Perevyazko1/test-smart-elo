import {createAsyncThunk} from "@reduxjs/toolkit";

import {ThunkConfig} from "@app";

import {WeekInfo} from "../types/weekInfo";
import {errorApiHandler} from "@shared/api";


type fetchWeekDataProps = {
    department_id: number;
    view_mode?: string;
}


export const fetchWeekData = createAsyncThunk<WeekInfo, fetchWeekDataProps, ThunkConfig<string>>(
    'eq/fetchWeekData',
    async (params: fetchWeekDataProps, thunkAPI) => {
        const {extra} = thunkAPI;

        try {
            const response = await extra.api.get<WeekInfo>('/core/get_week_data/', {
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
            return thunkAPI.rejectWithValue('Ошибка сервера');
        }
    }
)