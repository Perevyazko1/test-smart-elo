import {AnyAction, CombinedState, EnhancedStore, Reducer, ReducersMapObject} from "@reduxjs/toolkit";
import {AxiosInstance} from "axios";

import {rtkAPI} from "shared/api/rtkAPI";
import {AuthByPinCodeSchema} from "features/AuthByPinCode";
import {EmployeeSchema} from "entities/Employee/model/types/employee";
import {OrderProductInfoSchema} from "widgets/OrderProductInfo";
import {NotificationList} from "widgets/Notification";
import {AuditWidgetSchema} from "widgets/AuditWidget";
import {EqSchema, ListControl} from "pages/EQPage/model/types/eqSchema";
import {TaxControlSchema} from "pages/TaxControlPage";
import {normalizedEqData} from "pages/TestPage/model/types/eq_types";
import {EqContentDesktop, EqContentMobile, EqFilters} from "pages/EqPageNew";

export interface StateSchema {
    employee: EmployeeSchema,
    [rtkAPI.reducerPath]: ReturnType<typeof rtkAPI.reducer>


    // Асинхронные редюсеры
    eqDesktop?: EqContentDesktop,
    eqMobile?: EqContentMobile,
    eqFilters?: EqFilters,


    eqPage?: normalizedEqData,

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
