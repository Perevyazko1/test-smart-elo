import {CombinedState, Reducer} from 'redux';
import {configureStore, ReducersMapObject} from "@reduxjs/toolkit";

import {rtkAPI} from "shared/api/rtkAPI";
import {employeeReducer} from "entities/Employee";

import {StateSchema} from "./StateSchema";
import {createReducerManager} from "./reducerManager";
import {TypedUseSelectorHook, useSelector} from "react-redux";
import {$api} from "../../../../shared/api/api";


export function createReduxStore(initialState?: StateSchema) {
    const rootReducers: ReducersMapObject<StateSchema> = {
        employee: employeeReducer,
        [rtkAPI.reducerPath]: rtkAPI.reducer,
    }

    const reducerManager = createReducerManager(rootReducers)

    // @ts-ignore
    const store = configureStore({
        reducer: reducerManager.reduce as Reducer<CombinedState<StateSchema>>,
        preloadedState: initialState,
        devTools: true,
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                thunk: {
                    extraArgument: {
                        api: $api,
                    }
                }
            }).concat(rtkAPI.middleware),
    })

    // @ts-ignore
    store.reducerManager = reducerManager

    return store
}

export type AppDispatch = ReturnType<typeof createReduxStore>['dispatch'];
export type RootState = Reducer<CombinedState<StateSchema>>;
