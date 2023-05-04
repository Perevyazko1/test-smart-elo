import {product} from "entities/Product";
import {department} from "entities/Department";
import {tariff} from "entities/Tariff";


export interface TaxControlData {
    product: product;
    department: department;
    tariff: tariff | undefined;
}

export interface TaxControlSchema {
    is_loading: boolean;
    data?: TaxControlData[];
}