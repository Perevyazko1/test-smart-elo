import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Employee, EmployeeSchema} from "../types/employee";
import {USER_LOCALSTORAGE_KEY} from "../../../../shared/const/localstorage";


const initialState: EmployeeSchema = {
    authData: undefined,
    _inited: false,
}


export const employeeSlice = createSlice({
    name: 'employee',
    initialState,
    reducers: {
        setEmployee: (state, action: PayloadAction<Employee>) => {
            state.authData = action.payload
        },
        initAuthData: (state) => {
            const employee = localStorage.getItem(USER_LOCALSTORAGE_KEY);
            if (employee) {
                state.authData = JSON.parse(employee)
            }
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

