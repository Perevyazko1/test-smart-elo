import {eq_card} from "entities/EqPageCard";
import {EntityState} from "@reduxjs/toolkit";

export interface eq_data {
    results: eq_card[];
    count: number;
    next: string | null;
    previous: string | null;
}

export interface normalizedEqData extends Omit<eq_data, 'results'> {
    results: EntityState<eq_card>,
    is_loading: boolean,
    has_updated: boolean,
    not_relevant_id: number[],
}