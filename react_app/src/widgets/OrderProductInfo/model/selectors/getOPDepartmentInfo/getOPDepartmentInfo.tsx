import {StateSchema} from "app/providers/StoreProvider";

export const getOPDepartmentInfo = (
    state: StateSchema) => state.orderProductInfo?.order_product_tables_data?.department_info