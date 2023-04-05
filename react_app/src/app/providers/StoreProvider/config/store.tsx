import {configureStore} from "@reduxjs/toolkit";
import {StateSchema} from "./StateSchema";
import {authByPinCodeReducer} from "features/AuthByPinCode";
import {employeeReducer} from "../../../../entities/Employee/model/slice/employeeSlice";


export function createReduxStore(initialState?: StateSchema) {
    return configureStore<StateSchema>({
        reducer: {
            authByPinCode: authByPinCodeReducer,
            employee: employeeReducer,
        },
        preloadedState: initialState,
        devTools: true
    })
}