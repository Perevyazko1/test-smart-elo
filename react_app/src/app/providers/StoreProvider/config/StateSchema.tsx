import {AnyAction, CombinedState, EnhancedStore, Reducer, ReducersMapObject} from "@reduxjs/toolkit";
import {AxiosInstance} from "axios";

import {rtkAPI} from "shared/api/rtkAPI";
import {AuthByPinCodeSchema} from "features/AuthByPinCode";
import {EmployeeSchema} from "entities/Employee/model/types/employee";
import {NotificationList} from "widgets/Notification";
import {AuditWidgetSchema} from "widgets/AuditWidget";
import {TaxControlSchema} from "pages/TaxControlPage";
import {EqContentDesktop, EqListData, EqFilters} from "pages/EqPageNew";

export interface StateSchema {
    employee: EmployeeSchema,
    [rtkAPI.reducerPath]: ReturnType<typeof rtkAPI.reducer>


    // Асинхронные редюсеры
    eqDesktop?: EqContentDesktop,
    eqMobile?: EqListData,
    eqFilters?: EqFilters,

    authByPinCode?: AuthByPinCodeSchema,
    auditWidget?: AuditWidgetSchema,
    taxControl?: TaxControlSchema,
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
