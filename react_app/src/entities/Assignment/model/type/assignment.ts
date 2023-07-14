import {EntityState} from "@reduxjs/toolkit";

import {employee} from "../../../Employee";
import {department} from "../../../Department";
import {order_product} from "../../../OrderProduct";

export interface assignment {
    id: number;
    number: number;
    notes: string;
    status: 'in_work' | 'await' | 'ready';
    department: number;
    executor: employee | null;
    inspector: employee | null;
}

export interface extendedAssignment extends Omit<assignment, 'department'> {
    department: department;
    order_product: order_product;
}


export type assignment_list = {
    results: assignment[];
    count: number;
    next: string | null;
    previous: string | null;
}

export interface extended_api_assignment_list extends Omit<assignment_list, 'results'> {
    results: extendedAssignment[];
}

export interface normalizedAssignmentList extends Omit<assignment_list, 'results'> {
    results: EntityState<assignment>
}

export interface normalizedExtendedAssignmentList extends Omit<extended_api_assignment_list, 'results'> {
    results: EntityState<extendedAssignment>
}