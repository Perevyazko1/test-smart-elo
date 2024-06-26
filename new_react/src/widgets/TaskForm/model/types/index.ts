import {Task} from "@pages/TaskPage";


type ExtendedFields =
    'appointed_by' |
    'executor' |
    'co_executors' |
    'for_department' |
    'id' |
    'ready_at' |
    'created_by' |
    'verified_at';

export interface CreateTask extends Omit<Task, ExtendedFields> {
    created_by: number;
    appointed_by?: number | null;
    for_department?: number;
    executor: number | null;
    co_executors: number[];
    images?: File[];
}