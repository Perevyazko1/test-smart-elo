import {createAsyncThunk} from "@reduxjs/toolkit";
import axios from "axios";
import {employee} from "entities/Employee";
import {USER_LOCALSTORAGE_KEY} from 'shared/const/localstorage'
import {employeeActions} from "entities/Employee/model/slice/employeeSlice";
import {SERVER_HTTP_ADDRESS} from "shared/const/server_config";

interface authByPinCodeProps {
    pin_code: number,
    rememberMe: boolean,
}

export const authByPinCode = createAsyncThunk<employee, authByPinCodeProps, { rejectValue: string }>(
    'auth/authByPicCode',
    async (authData: authByPinCodeProps, thunkAPI) => {
        try {
            const response = await axios.post(`${SERVER_HTTP_ADDRESS}/api/v1/staff/pin_code_authentication/`, {
                ...authData
            });
            if (response.data) {
                if (authData.rememberMe) {
                    localStorage.setItem(USER_LOCALSTORAGE_KEY, JSON.stringify(response.data))
                }
                thunkAPI.dispatch(employeeActions.setEmployee(response.data))
                thunkAPI.dispatch(employeeActions.initAuthData())
                return response.data;
            } else {
                thunkAPI.dispatch(employeeActions.logout())
                thunkAPI.dispatch(employeeActions.initAuthData())
                throw new Error();
            }
        } catch (e) {
            // TODO написать обработку ошибок на различные статус коды ответа сервера
            console.log(e)
            thunkAPI.dispatch(employeeActions.logout())
            thunkAPI.dispatch(employeeActions.initAuthData())
            return thunkAPI.rejectWithValue('Неверный ПИН-код')
        }

    }
)