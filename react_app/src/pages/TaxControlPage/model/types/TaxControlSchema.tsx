import {product} from "entities/Product";
import {department} from "entities/Department";
import {tariff} from "entities/Tariff";


export interface TaxControlData {
    product: product;
    department: department;
    production_step_tariff: tariff | undefined;
}

export interface TaxControlSchema {
    is_loading: boolean;
    updated: boolean;

    product_name_filter: string,

    department_filter: department,

    view_modes?: string[],
    current_view_mode: string,


    data?: TaxControlData[];
}