import {AnyAction, CombinedState, EnhancedStore, Reducer, ReducersMapObject} from "@reduxjs/toolkit";
import {AxiosInstance} from "axios";

import {AuthByPinCodeSchema} from "features/AuthByPinCode";
import {EmployeeSchema} from "entities/Employee/model/types/employee";
import {EqSchema} from "pages/EQPage/model/types/eqSchema";
import {OrderProductInfoSchema} from "widgets/OrderProductInfo";
import {AuditWidgetSchema} from "widgets/AuditWidget";
import {taxControlSlice} from "../../../../pages/TaxConrtolPage/model/slice/taxControlPageSlice";
import {TaxControlSchema} from "../../../../pages/TaxConrtolPage/model/types/TaxControlSchema";

export interface StateSchema {
    employee: EmployeeSchema,

    // Асинхронные редюсеры
    authByPinCode?: AuthByPinCodeSchema,
    eq?: EqSchema,
    orderProductInfo?: OrderProductInfoSchema,
    auditWidget?: AuditWidgetSchema,
    taxControl?: TaxControlSchema,
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

export interface ThunkExtraArg {
    api: AxiosInstance;
}

export interface ThunkConfig<T> {
    rejectValue: T;
    extra: ThunkExtraArg;
    state: StateSchema;
}
