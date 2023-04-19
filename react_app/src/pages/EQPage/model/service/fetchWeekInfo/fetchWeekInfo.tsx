import {createAsyncThunk} from "@reduxjs/toolkit";
import axios from "axios";

import {SERVER_HTTP_ADDRESS} from "shared/const/server_config";
import {week_info} from "entities/WeekInfo";

import {eqActions} from "../../slice/eqSlice";

interface fetchWeekInfoProps {
    department_number: number,
    pin_code: number,
    week: number | undefined,
    year: number | undefined,
}

export const fetchWeekInfo = createAsyncThunk<week_info, fetchWeekInfoProps, {rejectValue: string}>(
    'eq/fetchWeekInfo',
    async (filters: fetchWeekInfoProps, thunkAPI) => {
        try {
            const response = await axios.get(`${SERVER_HTTP_ADDRESS}/api/v1/core/get_week_info/`, {
                params: {...filters}
            });
            if (response.data) {
                thunkAPI.dispatch(eqActions.setWeekInfo(response.data))
                return response.data;
            } else {
                throw new Error();
            }
        } catch (e) {
            // TODO написать обработку ошибок на различные статус коды ответа сервера
            console.log(e)
            return thunkAPI.rejectWithValue('Ошибка запроса')
        }
    }
)