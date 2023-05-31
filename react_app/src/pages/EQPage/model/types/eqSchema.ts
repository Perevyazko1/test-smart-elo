import {order_product, order_product_list} from "entities/OrderProduct";
import {week_info} from "entities/WeekInfo";
import {createEntityAdapter, EntityState} from "@reduxjs/toolkit";

export interface ViewMode {
    name: string,
    key: number
}

export interface IOrderProductList extends Omit<order_product_list, 'results'> {
    results: EntityState<order_product>
}

export interface ListControl extends IOrderProductList {
    is_loading: boolean,
    has_updated: boolean,
    not_relevant_id: number[],
}


export interface EqSchema {
    week_info?: week_info,
    week_info_is_loading: boolean,
    week_info_updated: boolean,

    project_filters?: string[],
    current_project?: string,
    view_modes?: ViewMode[],
    current_view_mode?: ViewMode,
    series_size: number,
}

export const eqListAdapter = createEntityAdapter<order_product>({
    selectId: (order_product) => order_product.id,
    sortComparer: (a, b) => {
        const urgencyDiff = a.urgency - b.urgency;
        if (urgencyDiff !== 0) {
            return urgencyDiff;
        }

        return a.series_id.localeCompare(b.series_id);
    },
})
