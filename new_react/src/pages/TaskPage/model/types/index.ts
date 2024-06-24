import {Department} from "@entities/Department";
import {Employee} from "@entities/Employee";

import {TaskStatus, TaskUrgency, TaskViewMode} from "../consts";
import {ApiList} from "@shared/types";
import {CreateTask} from "@widgets/TaskForm/model/types";
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
    for_department?: Department;
    title: string;
    description?: string;

    deadline?: string;
    created?: string;
    ready_at?: string;
    verified_at?: string;

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
    'task_images';

export interface UpdateTask extends Omit<Task, UpdateTaskOmitFields> {
    title?: string;
    status?: TaskStatus;
    urgency?: TaskViewMode;
    view_mode?: TaskViewMode;
    appointed_by?: number | null;
    executor?: number | null;
    co_executors?: number[];
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
