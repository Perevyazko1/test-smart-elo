import {EntityState} from "@reduxjs/toolkit";

import {ApiList} from "@shared/types";

import {EqCard} from "./eqCard";
import {ViewMode} from "../types/viewMode";
import {WeekData} from "../types/weekInfo";

export interface EqListData extends Omit<ApiList<EqCard>, 'results'> {
    results: EntityState<EqCard>;
    isLoading: boolean;
    hasUpdated: boolean;
}

interface EqFilters<T> {
    currentFilter: T,
    filters: T[],
    default: T,
    isLoading: boolean,
}

export interface EqBodySchema {
    // Фильтра ЭЛО
    projects: EqFilters<string>,
    viewModes: EqFilters<ViewMode>,

    // Блок недель
    weekData: WeekData,

    // Списки карточек
    awaitList: EqListData,
    inWorkList: EqListData,
    readyList: EqListData,

}

export const InitialEqBodySchema: EqBodySchema = {
    projects: {
        filters: ['Все проекты'],
        currentFilter: 'Все проекты',
        default: 'Все проекты',
        isLoading: false,
    },
    viewModes: {
        filters: [],
        currentFilter: {
            name: 'Личные наряды',
            key: 'self'
        },
        default: {
            name: 'Личные наряды',
            key: 'self'
        },
        isLoading: false,
    },

    weekData: {
        str_dates: [],
        dt_dates: [],
        date_range: [],
        previous_week_data: null,
        next_week_data: null,
        week: undefined,
        year: undefined,
        hasUpdated: false,
        isLoading: true,
        earned: "0",
    },

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