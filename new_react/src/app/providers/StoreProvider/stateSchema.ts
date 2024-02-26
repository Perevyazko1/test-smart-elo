import {AnyAction, CombinedState, EnhancedStore, Reducer, ReducersMapObject} from "@reduxjs/toolkit";
import {AxiosInstance} from "axios";

import {EqPageSchema} from "@pages/EqPage";
import {AssignmentSchema} from "@pages/AssignmentPage";
import {ProductsSchema} from "@pages/ProductPage";
import {TariffPageSchema} from "@pages/TariffPage";

import {rtkAPI} from "@shared/api";
import {AuditWidgetSchema} from "@widgets/UserActions";
import {ProductDetailsSchema} from "@pages/ProductDetailsPage";

export interface StateSchema {
    [rtkAPI.reducerPath]: ReturnType<typeof rtkAPI.reducer>

    // Асинхронные редюсеры
    eqPage?: EqPageSchema;
    assignments?: AssignmentSchema;
    products?: ProductsSchema;
    tariffs?: TariffPageSchema;
    auditWidget?: AuditWidgetSchema;
    productDetails?: ProductDetailsSchema;
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
