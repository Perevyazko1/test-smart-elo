import {ViewMode} from "../types/viewMode";
import {WeekData} from "../types/weekInfo";

interface EqFilters<T> {
    currentFilter: T,
    filters: T[],
    default: T,
    isLoading: boolean,
    inited: boolean,
}

export interface EqPageSchema {
    // Фильтра ЭЛО
    projects: EqFilters<string>;
    viewModes: EqFilters<ViewMode>;

    // Блок недель
    weekData: WeekData;

    notRelevantIds: number[];
    filtersReady: boolean;
    filtersInited: boolean;
}

export const InitialEqBodySchema: EqPageSchema = {
    projects: {
        filters: ['Все проекты'],
        currentFilter: 'Все проекты',
        default: 'Все проекты',
        isLoading: true,
        inited: false,
    },
    viewModes: {
        filters: [],
        currentFilter: {
            name: 'Мои наряды',
            key: 'self'
        },
        default: {
            name: 'Мои наряды',
            key: 'self'
        },
        isLoading: true,
        inited: false,
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
        inited: false,
        earned: 0,
        is_boss: false,
    },

    notRelevantIds: [],
    filtersReady: false,
    filtersInited: false,
}