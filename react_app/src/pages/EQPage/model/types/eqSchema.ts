import {order_product_list, order_product} from "entities/OrderProduct";
import {week_info} from "entities/WeekInfo";

export interface ViewMode {
    name: string,
    key: number
}

export interface EqSchema {
    // TODO Рассмотреть добавление индикатора загрузки при инициализации
    await_list?: order_product_list;
    in_work_list?: order_product_list;
    ready_list?: order_product_list;
    week_info?: week_info,
    project_filters?: string[],
    current_project?: string,
    view_modes?: ViewMode[],
    current_view_mode?: ViewMode,
    series_size: number,
    await_list_updated: boolean,
    in_work_list_updated: boolean,
    ready_list_updated: boolean,

    await_list_is_loading: boolean,
    in_work_list_is_loading: boolean,
    ready_list_is_loading: boolean,

    show_card_info?: order_product | undefined,
}