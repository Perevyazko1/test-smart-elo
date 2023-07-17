import {EntityState} from "@reduxjs/toolkit";

import {assignment} from "../../../Assignment";
import {order_product} from "../../../OrderProduct";


type card_info = {
    count_all: number;
    count_in_work: number;
    count_ready: number;
    count_await: number;
    tariff: number;
}

type department_info = {
    full_name: string;
    count_in_work: number;
}


export interface eq_card extends order_product {
    assignments: assignment[];
    card_info: card_info;
    department_info: department_info[];
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
