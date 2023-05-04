import {product} from "entities/Product";
import {department} from "entities/Department";
import {employee} from "entities/Employee";

export interface tariff {
    product: product,
    department: department,
    approved_by: employee,
    tariff: number,
    confirmation_date: string
}