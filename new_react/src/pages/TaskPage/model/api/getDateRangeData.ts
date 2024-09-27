import {createAsyncThunk} from "@reduxjs/toolkit";
import {ThunkConfig} from "@app";

import {errorApiHandler} from "@shared/api";

import {DateRangeData} from "../types";

interface getDateRangeDataProps {
    start_date: string | undefined;
    end_date: string | undefined;
}


export const getDateRangeData = createAsyncThunk<DateRangeData, getDateRangeDataProps, ThunkConfig<string>>(
    'tasks/getDateRangeData',
    async (params: getDateRangeDataProps, thunkAPI) => {
        const {extra} = thunkAPI;

        try {
            const response = await extra.api.get<DateRangeData>('/tasks/get_date_range_data/', {
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