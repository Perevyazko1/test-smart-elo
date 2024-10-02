import {createSelector} from 'reselect';

import {StateSchema} from "@app";

export const getOrderData = (state: StateSchema) => state.orderDetail?.data;

export const getOrderProps = createSelector(
    (state: StateSchema) => state.orderDetail,
    (orderDetail) => ({
        isLoading: orderDetail?.isLoading,
        hasUpdated: orderDetail?.hasUpdated,
    })
);

