import {Product} from "@entities/Product";

export type ListTypes = 'await' | 'in_work' | 'ready' | 'distribute';


export interface EqOrder {
    id: number;
    project: string;
    planned_date: string | null;
    comment_base: string;
    comment_case: string;
    moment: string;
    inner_number: string;
}

export interface EqFabric {
    id: number;
    name: string;
    image: string | null;
    thumbnail: string | null;
}

export interface EqTariff {
    id: number;
    amount: number;
}

export interface EqAssignmentCoExecutor {
    id: number;
    co_executor: number;
    amount: number;
    assignment: number;
}

export interface EqAssignment {
    id: number;
    new_tariff: EqTariff | null;
    executor: number | null;
    amount: number;
    number: number;
    plane_date: string | null;
    status: 'in_work' | 'await' | 'ready' | 'created';
    inspector: number | null;
    appointed_by_boss: boolean;
    assembled: boolean;
    co_executors?: EqAssignmentCoExecutor[];
}

export interface EqDepartmentInfo {
    full_name: string;
    count_in_work: number;
    count_all: number;
}

export interface EqCardInfo {
    count_all: number;
    further_packaging: boolean;
    count_in_work: number;
    count_ready: number;
    count_await: number;
    tariff: number;
    proposed_tariff: number;
    production_step__id: number;
    employees_info: EqDepartmentInfo[];
}

export interface EqOrderProduct {
    id: number;
    series_id: string;
    urgency: number;
    product: Product;
    order: EqOrder;
    main_fabric: EqFabric | null;
    second_fabric: EqFabric | null;
    third_fabric: EqFabric | null;
    assignments: EqAssignment[];
    plane_date: string | null;
    card_info: EqCardInfo;
}