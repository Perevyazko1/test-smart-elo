import {CombinedState, Reducer} from 'redux';
import {configureStore, ReducersMapObject} from "@reduxjs/toolkit";

import {rtkAPI, $axiosAPI} from "@shared/api";

import {createReducerManager} from "./reducerManager";
import {StateSchema} from "./stateSchema";
import {taskPageReducer} from "@pages/TaskPage/model/slice";


export function createReduxStore(initialState?: StateSchema) {
    const rootReducers: ReducersMapObject<StateSchema> = {
        [rtkAPI.reducerPath]: rtkAPI.reducer,
        taskPage: taskPageReducer,
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
                        api: $axiosAPI,
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
