import {ApiList} from "@shared/types";
import {WeekData} from "@pages/EqPage/model/types/weekInfo";
import {Task} from "@entities/Task";


interface SectionType extends ApiList<Task> {
    isLoading: boolean;
    hasUpdated: boolean;
}

export interface TaskPageSchema {
    viewModeInited: boolean;
    sortModeInited: boolean;
    await: SectionType;
    inWork: SectionType;
    ready: SectionType;
    noRelevantIds: number[];
    week_data: WeekData | null;
}
