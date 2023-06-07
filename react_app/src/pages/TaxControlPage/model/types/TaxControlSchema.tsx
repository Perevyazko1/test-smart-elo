import {product} from "entities/Product";
import {department} from "entities/Department";
import {tariff} from "entities/Tariff";
import {createEntityAdapter, EntityState} from "@reduxjs/toolkit";


export interface TaxControlData {
    id: number;
    product: product;
    department: department;
    production_step_tariff: tariff | undefined;
}

export interface TaxControlList {
    results: TaxControlData[];
    count: number;
    next: string | null;
    previous: string | null;
}

export interface ITaxControlList extends Omit<TaxControlList, 'results'> {
    results: EntityState<TaxControlData>
}

export interface TaxControlSchema extends ITaxControlList {
    not_relevant_id: number[];
    is_loading: boolean;
    updated: boolean;

    product_name_filter: string,
    department_filter: department,
    view_modes?: string[],
    current_view_mode: string,
}

export const taxControlListAdapter = createEntityAdapter<TaxControlData>({
    selectId: (taxControl) => taxControl.id,
})
