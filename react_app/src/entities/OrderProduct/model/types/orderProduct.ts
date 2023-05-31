import {product} from "entities/Product";
import {assignment} from "entities/Assignment";
import {fabric} from "entities/Fabric";
import {order} from "entities/Order";


export interface order_product {
    id: number;
    series_id: string;
    product: product;
    main_fabric: fabric;
    second_fabric: fabric;
    third_fabric: fabric;
    order: order;
    urgency: number;
    comment_base: string;
    comment_case: string;
    assignments: assignment[];
    tariff: number;
    count_all: number;
    count_in_work: number;
    count_ready: number;
    count_await: number;

}

export interface order_product_list {
    results: order_product[];
    count: number;
    next: string | null;
    previous: string | null;
}