import {ApiList} from "@shared/types";
import {Task} from "@entities/Task";


interface SectionType extends ApiList<Task> {
    isLoading: boolean;
    hasUpdated: boolean;
    reqId: number | null;
}

export interface DateRange {
    start_date: string;
    end_date: string;
}

export interface DateRangeData {
    date_range: DateRange;
    previous_range: DateRange;
    next_range: DateRange;
    range_type: string;
    range_value: string;
}

export interface TaskPageSchema {
    viewModeInited: boolean;
    sortModeInited: boolean;
    await: SectionType;
    inWork: SectionType;
    ready: SectionType;
    noRelevantIds: number[];
    date_range_data: DateRangeData | null;
}