import {fabric} from "../../../Fabric";
import {assignment} from "../../../Assignment";
import {product} from "../../../Product";
import {order} from "../../../Order";
import {EntityState} from "@reduxjs/toolkit";


type card_info = {
    count_all: number;
    count_in_work: number;
    count_ready: number;
    count_await: number;
    tariff: number;
}


export type eq_card = {
    product: product;
    main_fabric: fabric;
    second_fabric: fabric;
    third_fabric: fabric;
    order: order;
    assignments: assignment[];
    card_info: card_info;
    id: number;
    series_id: string;
    urgency: number;
    comment_base: string;
    comment_case: string;
}

export type eq_page_list = {
    results: eq_card[];
    count: number;
    next: string | null;
    previous: string | null;
}

export interface normalized_page_list extends Omit<eq_page_list, 'results'> {
    results: EntityState<eq_card>
}
