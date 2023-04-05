import {createSlice} from '@reduxjs/toolkit';
import {EmployeeSchema} from "../types/employeeSchema";


const initialState: EmployeeSchema = {
    username: 'anonymous',
}


export const employeeSlice = createSlice({
    name: 'employee',
    initialState,
    reducers: {
        setEmployee: (state, action) => {
            console.log(action.payload)
            state = action.payload
        },
    }
})

export const {actions: employeeActions} = employeeSlice;
export const {reducer: employeeReducer} = employeeSlice;

