import {order_product_list} from "entities/OrderProduct";
import {week_info} from "entities/WeekInfo";

export interface ViewMode {
    name: string,
    key: number
}

export interface OrderProductCardContext {
    department_number: number,
    order_product_id: string,
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
    eq_updated: boolean,
    show_card_info?: OrderProductCardContext | undefined,
}