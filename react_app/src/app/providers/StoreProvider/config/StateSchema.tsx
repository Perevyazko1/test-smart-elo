import {AuthByPinCodeSchema} from "features/AuthByPinCode";
import {EmployeeSchema} from "entities/Employee/model/types/employee";
import {AnyAction, CombinedState, EnhancedStore, Reducer, ReducersMapObject} from "@reduxjs/toolkit";

export interface StateSchema {
    employee: EmployeeSchema,


    // Асинхронные редюсеры
    authByPinCode?: AuthByPinCodeSchema,
}

export type StateSchemaKey = keyof StateSchema;

export interface ReducerManager {
    getReducerMap: () => ReducersMapObject<StateSchema>;
    // true - вмонтирован, false - демонтирован
    getMountedReducers: () => MountedReducers;
    reduce: (state: StateSchema, action: AnyAction) => CombinedState<StateSchema>;
    add: (key: StateSchemaKey, reducer: Reducer) => void;
    remove: (key: StateSchemaKey) => void;
}

export type MountedReducers = Partial<Record<StateSchemaKey, boolean>>;

export interface ReduxStoreWithManager extends EnhancedStore<StateSchema> {
    reducerManager: ReducerManager;
}