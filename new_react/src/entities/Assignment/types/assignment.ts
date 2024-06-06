import {Employee} from "@entities/Employee";
import {Department} from "@entities/Department";
import {EntityState} from "@reduxjs/toolkit";
import {ApiList} from "@shared/types";
import {OrderProduct} from "@entities/OrderProduct";

export interface BaseAssignment {
    id: number;
    number: number;
    notes: string;
    status: 'in_work' | 'await' | 'ready' | 'created';
    department: number;
    executor: number;
    inspector: number;
    tariff: number;
    order_product: number;
    appointment_date: string | null;
    date_completion: string | null;
    inspect_date: string | null;
    plane_date: string | null;
    appointed_by_boss: boolean;
}

type ExtendedFields = 'department' | 'executor' | 'inspector' | 'tariff' | 'order_product';

export interface Assignment extends Omit<BaseAssignment, ExtendedFields> {
    executor: Employee | null;
    order_product: OrderProduct;
    inspector: Employee | null;
    department: Department;
}

export interface AssignmentApiList extends ApiList<Assignment> {
}

export interface NorAssignmentList extends Omit<AssignmentApiList, 'results'> {
    results: EntityState<Assignment>
}
