import {createAsyncThunk} from "@reduxjs/toolkit";
import axios from "axios";

import {SERVER_HTTP_ADDRESS} from "shared/const/server_config";

export enum Actions {
    AWAIT_TO_IN_WORK = 'await_to_in_work',
    IN_WORK_TO_READY = 'in_work_to_ready',
    READY_TO_IN_WORK = 'ready_to_in_work',
    IN_WORK_TO_AWAIT = 'in_work_to_await',
    CONFIRMED = 'confirmed',
}

interface fetchUpdateAssignmentsProps {
    action: Actions,
    series_id: string,
    numbers: number[],
    pin_code: number,
    department_number: number,
}

export const fetchUpdateAssignments = createAsyncThunk<any, fetchUpdateAssignmentsProps, {rejectValue: string}>(
    'eq/fetchEqOrderProductList',
    async (params: fetchUpdateAssignmentsProps, thunkAPI) => {
        try {
            const response = await axios.post(`${SERVER_HTTP_ADDRESS}/api/v1/core/update_assignments/`, {
                ...params
            });

            if (response.data) {
                console.log(response.data)
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