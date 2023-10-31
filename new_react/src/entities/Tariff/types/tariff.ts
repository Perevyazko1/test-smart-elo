import {Product} from "@entities/Product";
import {Department} from "@entities/Department";
import {Employee} from "@entities/Employee";

export interface BaseTariff {
    product: number;
    department: number;
    approved_by: number | null;
    tariff: number;
    confirmation_date: string;
}

type ExtendedFields = 'product' | 'department' | 'approved_by';

export interface Tariff extends Omit<BaseTariff, ExtendedFields> {
    product: Product;
    department: Department;
    approved_by: Employee;
}