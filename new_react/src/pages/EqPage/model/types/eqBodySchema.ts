import {EntityState} from "@reduxjs/toolkit";

import {ApiList} from "@shared/types";

import {EqCard} from "./eqCard";

export interface EqListData extends Omit<ApiList<EqCard>, 'results'> {
    results: EntityState<EqCard>;
    isLoading: boolean;
    hasUpdated: boolean;
}

export interface EqBodySchema {
    awaitList: EqListData,
    inWorkList: EqListData,
    readyList: EqListData,
}

export const InitialEqBodySchema: EqBodySchema = {
    awaitList: {
        results: {
            ids: [],
            entities: {},
        },
        count: 0,
        isLoading: true,
        hasUpdated: false,
        next: null,
        previous: null,
    },
    inWorkList: {
        results: {
            ids: [],
            entities: {},
        },
        count: 0,
        isLoading: true,
        hasUpdated: false,
        next: null,
        previous: null,
    },
    readyList: {
        results: {
            ids: [],
            entities: {},
        },
        count: 0,
        isLoading: true,
        hasUpdated: false,
        next: null,
        previous: null,
    },
}