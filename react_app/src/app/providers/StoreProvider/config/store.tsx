import {configureStore, ReducersMapObject} from "@reduxjs/toolkit";
import {StateSchema} from "./StateSchema";
import {authByPinCodeReducer} from "features/AuthByPinCode";
import {employeeReducer} from "../../../../entities/Employee/model/slice/employeeSlice";


export function createReduxStore(initialState?: StateSchema) {
    const rootReducers: ReducersMapObject<StateSchema> = {
        authByPinCode: authByPinCodeReducer,
        employee: employeeReducer,
    }

    return configureStore<StateSchema>({
        reducer: rootReducers,
        preloadedState: initialState,
        devTools: true
    })
}

export type AppDispatch = ReturnType<typeof createReduxStore>['dispatch'];