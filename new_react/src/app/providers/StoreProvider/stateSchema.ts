import {AnyAction, CombinedState, EnhancedStore, Reducer, ReducersMapObject} from "@reduxjs/toolkit";
import {AxiosInstance} from "axios";

import {EqPageSchema} from "@pages/EqPage";
import {AssignmentSchema} from "@pages/AssignmentPage";
import {ProductsSchema} from "@pages/ProductPage";
import {ProductDetailsSchema} from "@pages/ProductDetailsPage";
import {OrdersPageSchema} from "@pages/OrdersPage";

import {AuditWidgetSchema} from "@widgets/UserActions";
import {OrderDetailsSchema} from "@widgets/OrderDetailWidget";
import {rtkAPI} from "@shared/api";
import {AppNavbarSchema} from "@widgets/AppNavbar";
import {TarifficationPageSchema} from "@pages/TarifficationPage";
import {PostTarifficationSchema} from "@widgets/PostTarifficationWidget";

export interface StateSchema {
    [rtkAPI.reducerPath]: ReturnType<typeof rtkAPI.reducer>

    // Асинхронные редюсеры
    tarifficationPage?: TarifficationPageSchema;
    eqPage?: EqPageSchema;
    appNavbar?: AppNavbarSchema;
    orderDetail?: OrderDetailsSchema;
    orders?: OrdersPageSchema;
    assignments?: AssignmentSchema;
    products?: ProductsSchema;
    auditWidget?: AuditWidgetSchema;
    productDetails?: ProductDetailsSchema;
    postTariffication?: PostTarifficationSchema;
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
