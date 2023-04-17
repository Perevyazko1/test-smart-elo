import {StateSchema} from "app/providers/StoreProvider";

export const getOPProductionInfo = (
    state: StateSchema) => state.orderProductInfo?.order_product_tables_data?.production_info