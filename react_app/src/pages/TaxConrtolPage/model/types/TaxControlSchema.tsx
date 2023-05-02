import {product} from "entities/OrderProduct/model/types/orderProduct";
import {department} from "entities/Department";
import {employee} from "entities/Employee";

export interface TaxControlData {
    product: product,
    department: department,
    tax: number,
    confirmation_date: string,
    approved_by: employee,
}

export interface TaxControlSchema {
    is_loading: boolean,
    data?: TaxControlData[]
}