import {createEntityAdapter} from "@reduxjs/toolkit";
import {TechProcess} from "@entities/TechProcess";
import {Employee} from "@entities/Employee";

export interface EqProductPictures {
    id: number;
    image: string;
    thumbnail: string;
}

export interface EqProduct {
    id: number;
    name: string;
    product_pictures: EqProductPictures[];
    technological_process: TechProcess | null;
    technological_process_confirmed: Employee | null;
}


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

export interface EqAssignment {
    id: number;
    number: number;
    status: 'in_work' | 'await' | 'ready' | 'created';
    inspector: number | null;
    appointed_by_boss: boolean;
    assembled: boolean;
}

export interface EqDepartmentInfo {
    full_name: string;
    count_in_work: number;
    count_all: number;
}

export interface EqCardInfo {
    count_all: number;
    count_in_work: number;
    count_ready: number;
    count_await: number;
    tariff: number;
    proposed_tariff: number;
    production_step__id: number;
}

export interface EqOrderProduct {
    id: number;
    series_id: string;
    urgency: number;
    product: EqProduct;
    order: EqOrder;
    main_fabric: EqFabric | null;
    second_fabric: EqFabric | null;
    third_fabric: EqFabric | null;
    assignments: EqAssignment[];
    further_packaging: boolean;
    department_info: EqDepartmentInfo[];
    plane_date: string | null;
    card_info: EqCardInfo;
}

export const eqCardEntityAdapter = createEntityAdapter<EqOrderProduct>({
    selectId: (eq_card) => eq_card.series_id,
    sortComparer: (a, b) => {
        const urgencyDiff = a.urgency - b.urgency;
        if (urgencyDiff !== 0) {
            return urgencyDiff;
        }

        const orderNumberDiff = a.order.id - b.order.id;
        if (orderNumberDiff !== 0) {
            return orderNumberDiff;
        }

        return a.id - b.id;
    },
})


export interface DepInfo {
    id: number,
    full_name: string,
    in_work: number,
    ready: number,
    confirmed: number,
}

export interface ResponseDepInfo {
    department_info: DepInfo[];
}

export interface ProductionInfo {
    department_name: string,
    await: number,
    assembled: number,
    in_work: number,
    ready: number,
    confirmed: number,
}

export interface ResponseProdInfo {
    production_info: ProductionInfo[];
}
