import {Department} from "@entities/Department";
import {ApiList} from "@shared/types";


export interface Tariff {
    id: number;
    amount: number;
    add_date: string;
    created_by: number;
    comment: string;
}

interface ProductImages {
    images: string[];
    thumbnail: string[];
}

export interface PageListItem {
    id: number;
    department: Department;
    has_assignments: boolean;
    product_name: string;
    product_id: number;
    last_order_id: number | null;
    product_images: ProductImages,
    confirmed_tariff: Tariff | null;
    proposed_tariff: Tariff | null;
}


export interface TarifficationPageSchema extends ApiList<PageListItem> {
    isLoading: boolean;
    hasUpdated: boolean;
    projects: string[];
    noRelevantIds: number[];
}
