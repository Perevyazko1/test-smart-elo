import {order_product_list, order_product} from "entities/OrderProduct";
import {week_info} from "entities/WeekInfo";

export interface ViewMode {
    name: string,
    key: number
}

export interface ListControl {
    data?: order_product_list,
    is_loading: boolean,
    has_updated: boolean,
    current_size?: number,
}

export interface EqSchema {
    await_updated: number;

    in_work_data: ListControl;

    ready_data: ListControl;

    week_info?: week_info,
    week_info_is_loading: boolean,
    week_info_updated: boolean,

    project_filters?: string[],
    current_project?: string,
    view_modes?: ViewMode[],
    current_view_mode?: ViewMode,
    series_size: number,

    show_card_info?: order_product | undefined,
}