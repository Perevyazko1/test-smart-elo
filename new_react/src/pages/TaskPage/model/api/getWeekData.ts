import {createAsyncThunk} from "@reduxjs/toolkit";
import {ThunkConfig} from "@app";
import {errorApiHandler} from "@shared/api";
import {WeekData} from "@pages/EqPage/model/types/weekInfo";

interface getWeekDataProps {
    week: string | undefined;
    year: string | undefined;
}


export const getWeekData = createAsyncThunk<WeekData, getWeekDataProps, ThunkConfig<string>>(
    'tasks/getWeekData',
    async (params: getWeekDataProps, thunkAPI) => {
        const {extra} = thunkAPI;

        try {
            const response = await extra.api.get<WeekData>('/tasks/get_week_data/', {
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