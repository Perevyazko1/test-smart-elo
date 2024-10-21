import {CombinedState, Reducer} from 'redux';
import {configureStore, ReducersMapObject} from "@reduxjs/toolkit";

import {rtkAPI, $axiosAPI} from "@shared/api";

import {createReducerManager} from "./reducerManager";
import {StateSchema} from "./stateSchema";
import {taskPageReducer} from "@pages/TaskPage/model/slice";
import {tarifficationPageReducer} from "@pages/TarifficationPage/model/slice";
import {eqPageReducer} from "@pages/EqPage";
import {appNavbarReducer} from "@widgets/AppNavbar";
import {ordersDetailReducer} from "@widgets/OrderDetailWidget/model/slice";
import {ordersPageReducer} from "@pages/OrdersPage";
import {assignmentPageReducer} from "@pages/AssignmentPage/model/slice/assignmentPageSlice";
import {productsPageReducer} from "@pages/ProductPage/model/slice/productsPageSlice";
import {auditWidgetReducer} from "@widgets/UserActions/model/slice/auditWidgetSlice";
import {productDetailsPageReducer} from "@pages/ProductDetailsPage/model/slice/productDetailsSlice";
import {postTarifficationWidgetReducer} from "@widgets/PostTarifficationWidget/model/slice";


export function createReduxStore(initialState?: StateSchema) {
    const rootReducers: ReducersMapObject<StateSchema> = {
        [rtkAPI.reducerPath]: rtkAPI.reducer,
        taskPage: taskPageReducer,
        tarifficationPage: tarifficationPageReducer,
        eqPage: eqPageReducer,
        appNavbar: appNavbarReducer,
        orderDetail: ordersDetailReducer,
        orders: ordersPageReducer,
        assignments: assignmentPageReducer,
        products: productsPageReducer,
        auditWidget: auditWidgetReducer,
        productDetails: productDetailsPageReducer,
        postTariffication: postTarifficationWidgetReducer,
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

    return store;
}

export type AppDispatch = ReturnType<typeof createReduxStore>['dispatch'];
export type RootState = Reducer<CombinedState<StateSchema>>;
