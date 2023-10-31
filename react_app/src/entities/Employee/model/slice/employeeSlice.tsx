import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {employee, EmployeeSchema} from "../types/employee";
import {USER_LOCALSTORAGE_KEY, USER_LOCALSTORAGE_TOKEN} from "shared/const/localstorage";
import {department} from "../../../Department";


const initialState: EmployeeSchema = {
    authData: undefined,
    _inited: false,
}


export const employeeSlice = createSlice({
    name: 'employee',
    initialState,
    reducers: {
        setEmployee: (state, action: PayloadAction<employee>) => {
            state.authData = action.payload
            localStorage.setItem(USER_LOCALSTORAGE_TOKEN, action.payload.token)
        },
        setCurrentDepartment: (state, action: PayloadAction<department>) => {
            if (state.authData) {
                state.authData.current_department = action.payload
            }
        },

        initAuthData: (state) => {
            state._inited = true
        },

        logout: (state) => {
            state.authData = undefined;
            localStorage.removeItem(USER_LOCALSTORAGE_KEY);
        }
    }
})

export const {actions: employeeActions} = employeeSlice;
export const {reducer: employeeReducer} = employeeSlice;

