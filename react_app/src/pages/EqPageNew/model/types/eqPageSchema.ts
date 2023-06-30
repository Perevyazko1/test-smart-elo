import {week_info} from "entities/WeekInfo";
import {normalized_page_list} from "entities/EqPageCard";

export interface EqListData extends normalized_page_list {
    isLoading: boolean,
    hasUpdated: boolean | undefined,
    notRelevantId: number[],
}

export interface ViewMode {
    name: string,
    key: number
}

interface FilterData<T> {
    currentFilter: T,
    filters: T[],
    default: T,
    isLoading: boolean,
}

interface WeekData extends week_info {
    isLoading: boolean;
    hasUpdated: boolean;
}


export interface EqFilters {
    weekData: WeekData,
    projectFilter: FilterData<string>,
    viewModeFilter: FilterData<ViewMode>,
    seriesSize: number,
}

export interface EqContentDesktop {
    awaitList: EqListData,
    inWorkList: EqListData,
    readyList: EqListData,
}

export interface EqContentMobile {
    cardList: EqListData,
}