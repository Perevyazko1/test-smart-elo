import {EntityState} from "@reduxjs/toolkit";

import {technological_process} from "entities/TechnologicalProcess";
import {employee} from "entities/Employee";
import {product_picture} from "entities/ProductPicture";

export interface product {
    id: number;
    name: string;
    product_pictures: product_picture[] | undefined;
    technological_process: technological_process | undefined;
    technological_process_confirmed: employee | null;
}


export type product_list = {
    results: product[];
    count: number;
    next: string | null;
    previous: string | null;
}


export interface normalizedProductList extends Omit<product_list, 'results'> {
    results: EntityState<product>
}
