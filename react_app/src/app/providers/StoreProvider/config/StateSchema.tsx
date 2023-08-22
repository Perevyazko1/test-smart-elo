import {AnyAction, CombinedState, EnhancedStore, Reducer, ReducersMapObject} from "@reduxjs/toolkit";
import {AxiosInstance} from "axios";

import {rtkAPI} from "shared/api/rtkAPI";
import {AuthByPinCodeSchema} from "features/AuthByPinCode";
import {EmployeeSchema} from "entities/Employee";
import {NotificationList} from "widgets/Notification";
import {AuditWidgetSchema} from "widgets/AuditWidget";
import {EqContentDesktop, EqListData, EqFilters} from "pages/EqPageNew";
import {AssignmentSchema} from "pages/AssignmentPage";
import {ProductsSchema} from "pages/ProductsPage";
import {ProductDetailsSchema} from "pages/ProductDetailsPage";
import {TariffPageSchema} from "pages/TariffPage";

export interface StateSchema {
    employee: EmployeeSchema,
    [rtkAPI.reducerPath]: ReturnType<typeof rtkAPI.reducer>


    // Асинхронные редюсеры
    eqDesktop?: EqContentDesktop,
    eqMobile?: EqListData,
    eqFilters?: EqFilters,

    assignments?: AssignmentSchema,
    products?: ProductsSchema,
    tariff?: TariffPageSchema,
    productDetails?: ProductDetailsSchema,

    authByPinCode?: AuthByPinCodeSchema,
    auditWidget?: AuditWidgetSchema,
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
