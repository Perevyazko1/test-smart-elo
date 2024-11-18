import {Department} from "@entities/Department";
import {EntityState} from "@reduxjs/toolkit";
import {ApiList} from "@shared/types";
import {OrderProduct} from "@entities/OrderProduct";

export type AssignmentStatus = 'in_work' | 'await' | 'ready' | 'created';

export const assignmentStatusOptions: AssignmentStatus[] = ['in_work', 'await', 'ready', 'created'];

export interface BaseAssignment {
    id: number;
    number: number;
    notes: string;
    status: AssignmentStatus;
    department: number;
    executor: number | null;
    inspector: number | null;
    amount: number;
    new_tariff: number;
    order_product: number;
    appointment_date: string | null;
    date_completion: string | null;
    inspect_date: string | null;
    plane_date: string | null;
    tariffication_date: string | null;
    appointed_by_boss: boolean;
    assembled: boolean;
}

type ExtendedFields = 'department' | 'new_tariff' | 'order_product';

interface AssignmentTariff {
    id: number;
    amount: number;
}

export interface AssignmentCoExecutor {
    id?: number;
    amount: number;
    assignment: number;
    co_executor: number;
}

export interface AssignmentCoExecutorWrite {
    action: 'delete' | 'update_or_create';
    co_executor_ids?: number[];
    assignment_ids?: number[];
    data?: {
        co_executor__id: number;
        amount: number;
    };

}

export interface Assignment extends Omit<BaseAssignment, ExtendedFields> {
    co_executors: AssignmentCoExecutor[];
    order_product: OrderProduct;
    department: Department;
    new_tariff: AssignmentTariff | null;
}

export interface AssignmentApiList extends ApiList<Assignment> {
}

export interface NorAssignmentList extends Omit<AssignmentApiList, 'results'> {
    results: EntityState<Assignment, number>
}
