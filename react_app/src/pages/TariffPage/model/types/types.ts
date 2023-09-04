import {product} from "entities/Product";
import {department} from "entities/Department";
import {employee} from "entities/Employee";
import {createEntityAdapter, EntityState} from "@reduxjs/toolkit";


export interface Tariff {
    id?: number;

    tariff?: number;
    proposed_tariff?: number;

    proposed_date?: string;
    confirmation_date?: string;

    approved_by?: employee | null;
    approved_by_id?: number | null;

    proposed_by?: employee | null;
    proposed_by_id?: number | null;

    department_id?: number;

    product_id?: number;
}


export interface TariffPageCard {
    id: number;
    product: product;
    department: department;
    production_step_tariff: Tariff | null;
}

export interface TariffPageCardList {
    results: TariffPageCard[];
    count: number;
    next: string | null;
    previous: string | null;
}

export interface RetarifficationCard {
    id: number;
    executor: employee;
    string_representation: string;
    inspect_date: string;
    date_completion: string;
}

export interface NormalizedTariffPageCardList extends Omit<TariffPageCardList, 'results'> {
    results: EntityState<TariffPageCard>
}

export const tariffPageCardAdapter = createEntityAdapter<TariffPageCard>({
    selectId: (card) => card.id,
});

export interface TariffPageSchema extends NormalizedTariffPageCardList {
    isLoading: boolean;
    hasUpdated: boolean | undefined;
}

export type Ordering =
    null | 'executor' | '-executor' | 'inspect_date' | '-inspect_date' | 'date_completion' | '-date_completion';