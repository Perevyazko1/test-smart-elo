import {createSelector} from 'reselect';

import {StateSchema} from "@app";



export const getOrdersList = (state: StateSchema) => state.orders?.results

export const getOrdersProps = createSelector(
    (state: StateSchema) => state.orders,
    (orders) => ({
        next: orders?.next,
        previous: orders?.previous,
        count: orders?.count,
        isLoading: orders?.isLoading,
        hasUpdated: orders?.hasUpdated,
    })
);


