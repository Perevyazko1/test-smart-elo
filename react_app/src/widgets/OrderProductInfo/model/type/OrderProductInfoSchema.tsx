import {technological_process} from "entities/TechnologicalProcess";


export interface department_info {
    full_name: string,
    in_work: number,
    ready: number,
    confirmed: number,
}


export interface production_info {
    department_name: string,
    in_work: number,
    ready: number,
    confirmed: number,
}

export interface order_product_tables_data {
    department_info: department_info[],
    production_info: production_info[],
}


export interface OrderProductInfoSchema {
    tech_process_list?: technological_process[],
    current_tech_process?: technological_process,
    order_product_tables_data?: order_product_tables_data,
}