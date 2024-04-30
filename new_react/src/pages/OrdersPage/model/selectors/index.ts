import {StateSchema} from "@app";

export const getOrdersList = (state: StateSchema) => state.orders?.results

export const getOrdersProps = (state: StateSchema) => {
    return {
        count: state.orders?.count,
        isLoading: state.orders?.isLoading,
        next: state.orders?.next,
        hasUpdated: state.orders?.hasUpdated,
    }
}

