import {createAsyncThunk} from "@reduxjs/toolkit";
import axios from "axios";
import {Employee} from "entities/Employee";
import {USER_LOCALSTORAGE_KEY} from 'shared/const/localstorage'
import {employeeActions} from "entities/Employee/model/slice/employeeSlice";

interface authByPinCodeProps {
    pin_code: number,
    rememberMe: boolean,
}

export const authByPinCode = createAsyncThunk<Employee, authByPinCodeProps, {rejectValue: string}>(
    'auth/authByPicCode',
    async (authData: authByPinCodeProps, thunkAPI) => {
        try {
            const response = await axios.post('http://localhost:8000/api/v1/staff/pin_code_authentification', {
                ...authData
            });
            if (response.data) {
                if (authData.rememberMe) {
                    localStorage.setItem(USER_LOCALSTORAGE_KEY, JSON.stringify(response.data))
                }
                thunkAPI.dispatch(employeeActions.setEmployee(response.data))
                return response.data;
            } else {
                throw new Error();
            }
        } catch (e) {
            // TODO написать обработку ошибок на различные статус коды ответа сервера
            console.log(e)
            return thunkAPI.rejectWithValue('Неверный ПИН-код')
        }

    }
)