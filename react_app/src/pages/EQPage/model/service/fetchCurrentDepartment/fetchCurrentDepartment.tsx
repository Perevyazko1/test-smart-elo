import {createAsyncThunk} from "@reduxjs/toolkit";
import axios from "axios";

import {SERVER_HTTP_ADDRESS} from "shared/const/server_config";
import {employee, employeeActions} from "entities/Employee";

interface fetchCurrentDepartmentProps {
    department_number: number,
    pin_code: number,
}

export const fetchCurrentDepartment = createAsyncThunk<employee, fetchCurrentDepartmentProps, {rejectValue: string}>(
    'eq/fetchCurrentDepartment',
    async (filters: fetchCurrentDepartmentProps, thunkAPI) => {
        try {
            const response = await axios.post(`${SERVER_HTTP_ADDRESS}/api/v1/staff/change_current_department/`, {
                ...filters
            });
            if (response.data) {
                thunkAPI.dispatch(employeeActions.setEmployee(response.data))
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