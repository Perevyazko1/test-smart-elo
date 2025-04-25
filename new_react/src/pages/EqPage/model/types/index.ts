import {usePlanInfo} from "@pages/EqPage/model/api/planInfoApi";
import {EqOrderProduct} from "@widgets/EqCardList";
import {EqNumberListTipe} from "@widgets/EqCard/model/lib/createEqNumberLists";

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

export interface IPlanInfo {
    total_units_day: number,
    days_load: {
        [day: string]: number;
    }
}

export interface IDragItemCard {
    card: EqOrderProduct;
    assignmentsLists: EqNumberListTipe;
}

