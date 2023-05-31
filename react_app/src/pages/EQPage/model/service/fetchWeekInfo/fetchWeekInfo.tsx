import {createAsyncThunk} from "@reduxjs/toolkit";

import {SERVER_HTTP_ADDRESS} from "shared/const/server_config";
import {week_info} from "entities/WeekInfo";
import {ThunkConfig} from "app/providers/StoreProvider";
import {getCurrentDepartment, getEmployeePinCode} from "entities/Employee";

import {getCurrentProject} from "../../selectors/getCurrentProject/getCurrentProject";
import {getCurrentViewMod} from "../../selectors/getCurrentViewMod/getCurrentViewMod";

interface fetchWeekInfoProps {
    week: number | undefined,
    year: number | undefined,
}

export const fetchWeekInfo = createAsyncThunk<week_info, fetchWeekInfoProps, ThunkConfig<string>>(
    'eq/fetchWeekInfo',
    async (params: fetchWeekInfoProps, thunkAPI) => {
        const {extra, getState} = thunkAPI;

        const current_department = getCurrentDepartment(getState());
        const pin_code = getEmployeePinCode(getState());
        const project = getCurrentProject(getState());
        const view_mode = getCurrentViewMod(getState());

        try {
            const response = await extra.api.get<week_info>(`${SERVER_HTTP_ADDRESS}/api/v1/core/get_week_info/`, {
                params: {
                    department_number: current_department?.number,
                    pin_code: pin_code,
                    project: project,
                    view_mode: view_mode.key,
                    ...params
                }
            });
            if (response.data) {
                return response.data;
            } else {
                throw new Error();
            }
        } catch (e) {
            // TODO написать обработку ошибок на различные статус коды ответа сервера
            return thunkAPI.rejectWithValue('Ошибка запроса')
        }
    }
)