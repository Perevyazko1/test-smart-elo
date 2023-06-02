import {AnyAction, CombinedState, EnhancedStore, Reducer, ReducersMapObject} from "@reduxjs/toolkit";
import {AxiosInstance} from "axios";

import {AuthByPinCodeSchema} from "features/AuthByPinCode";
import {EmployeeSchema} from "entities/Employee/model/types/employee";
import {EqSchema, ListControl} from "pages/EQPage/model/types/eqSchema";
import {OrderProductInfoSchema} from "widgets/OrderProductInfo";
import {AuditWidgetSchema} from "widgets/AuditWidget";
import {TaxControlSchema} from "pages/TaxControlPage";
import {rtkAPI} from "shared/api/rtkAPI";
import {NotificationList} from "widgets/Notification";

export interface StateSchema {
    employee: EmployeeSchema,
    [rtkAPI.reducerPath]: ReturnType<typeof rtkAPI.reducer>

    // Асинхронные редюсеры
    authByPinCode?: AuthByPinCodeSchema,
    eq?: EqSchema,
    orderProductInfo?: OrderProductInfoSchema,
    auditWidget?: AuditWidgetSchema,
    taxControl?: TaxControlSchema,
    eqAwaitList?: ListControl,
    eqInWorkList?: ListControl,
    eqReadyList?: ListControl,
    notifications?: NotificationList,
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
