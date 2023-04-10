import {order_product_list} from "entities/OrderProduct/model/types/orderProduct";

export interface EqSchema {
    // TODO Рассмотреть добавление индикатора загрузки при инициализации
    await_list?: order_product_list;
    in_work_list?: order_product_list;
    ready_list?: order_product_list;
    eq_updated: boolean
}