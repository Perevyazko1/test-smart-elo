import {Task} from "@pages/TaskPage";


type ExtendedFields =
    'appointed_by' |
    'executor' |
    'co_executors' |
    'for_department' |
    'id' |
    'created' |
    'ready_at' |
    'verified_at';

export interface CreateTask extends Omit<Task, ExtendedFields> {
    appointed_by: number | null;
    for_department?: number;
    executor: number | null;
    co_executors: number[];
    images?: File[];
}