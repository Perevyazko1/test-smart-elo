import {Department} from "@entities/Department";
import {Employee} from "@entities/Employee";
import {ApiList} from "@shared/types";

import {TaskStatus, TaskUrgency, TaskViewMode} from "../consts";
import {WeekData} from "@pages/EqPage/model/types/weekInfo";

interface TaskImage {
    id: number;
    image: string;
    thumbnail: string;
}

export interface Task {
    id: number;
    status: TaskStatus;
    urgency: TaskUrgency;
    view_mode: TaskViewMode;
    for_departments?: Department[];
    title: string;
    description?: string;
    execution_comment?: string;

    deadline?: string;
    created_at?: string;
    ready_at?: string;
    verified_at?: string;
    appointed_at?: string;

    created_by?: Employee;
    appointed_by?: Employee;
    executor?: Employee;
    co_executors?: Employee[];
    task_images?: TaskImage[];
}

type UpdateTaskOmitFields =
    'status' |
    'urgency' |
    'view_mode' |
    'title' |
    'appointed_by' |
    'executor' |
    'co_executors' |
    'for_departments' |
    'task_images';

export interface UpdateTask extends Omit<Task, UpdateTaskOmitFields> {
    title?: string;
    status?: TaskStatus;
    urgency?: TaskViewMode;
    view_mode?: TaskViewMode;
    appointed_by?: number | null;
    executor?: number | null;
    co_executors?: number[];
    for_departments?: number[];
    task_images?: File[];
}


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
