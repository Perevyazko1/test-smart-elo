import {StateSchema} from "@app";

export const getOrderData = (state: StateSchema) => state.orderDetail?.data;

export const getOrderProps = (state: StateSchema) => {
    return {
        isLoading: state.orderDetail?.isLoading,
        hasUpdated: state.orderDetail?.hasUpdated,
    }
}

