import {createAsyncThunk} from "@reduxjs/toolkit";
import axios, {AxiosError} from "axios";
import {employee} from "entities/Employee";
import {USER_LOCALSTORAGE_KEY} from 'shared/const/localstorage'
import {employeeActions} from "entities/Employee/model/slice/employeeSlice";
import {SERVER_HTTP_ADDRESS} from "shared/const/server_config";
import {notificationsActions} from "../../../../../widgets/Notification";

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
                throw new Error();
            }
        } catch (error) {
            thunkAPI.dispatch(employeeActions.logout())
            thunkAPI.dispatch(employeeActions.initAuthData())

            if (error instanceof AxiosError) {
                if (error.response?.status === 401) {
                    thunkAPI.dispatch(notificationsActions.addNotification({
                        date: Date.now(),
                        type: "ошибка",
                        title: "Авторизация",
                        body: "Неверный ПИН-код.",
                    }))
                }
            }

            return thunkAPI.rejectWithValue('Ошибка входа')
        }

    }
)