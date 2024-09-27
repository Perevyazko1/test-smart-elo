export enum TaskStatus {
    Pending = '1',
    InProgress = '2',
    Completed = '3',
    Cancelled = '4'
}

export enum TaskUrgency {
    Low = '1',
    Normal = '2',
    Important = '3',
    Urgent = '4'
}

export enum TaskViewMode {
    OnlyMe = '1',
    DepartmentVisible = '2',
    EveryoneVisible = '3',
    ForParticipants = '4',
}

export interface TaskImage {
    id: number;
    image: string;
    thumbnail: string;
}

export interface TaskTariff {
    id: number;
    created_by: number;
    amount: number;
    comment: string;
}

export interface NewTaskTariff extends Omit<TaskTariff, 'id'> {

}

export interface TaskExecutor {
    id?: number;
    employee: number;
    amount: number;
}

export interface TaskComment {
    id: number;
    author: number;
    task: number;
    comment: string;
    add_date: string;

    viewers: TaskViewInfo[];
}

export interface NewTaskComment extends Omit<TaskComment, 'id' | 'add_date' | 'viewers'> {

}

export interface TaskViewInfo {
    id: number;
    employee: number;
    task: number;
    last_date: string;
}

export interface Task {
    id: number;
    status: TaskStatus;
    urgency: TaskUrgency;
    view_mode: TaskViewMode;
    for_departments: number[];
    title: string;
    description: string | null;
    deadline: string | null;
    appointed_by: number | null;
    appointed_at: string | null;
    created_at: string;
    ready_at: string | null;
    verified_at: string | null;
    created_by: number | null;
    new_executor: TaskExecutor | null;
    new_co_executors: TaskExecutor[];
    proposed_tariff: TaskTariff | null;
    confirmed_tariff: TaskTariff | null;
    appointed_by_boss: boolean;

    task_view_info: TaskViewInfo[];
    task_images: TaskImage[];

    new_comment_count: number;
    last_comment: TaskComment;
}

type TaskReadonlyFields =
    'new_comment_count' |
    'created_at' |
    'proposed_tariff' |
    'confirmed_tariff' |
    'last_comment';


export interface UpdateTask extends Partial<Omit<Task, TaskReadonlyFields>> {
    proposed_tariff?: NewTaskTariff;
    confirmed_tariff?: NewTaskTariff;
}


export interface NewTask extends Omit<UpdateTask, 'id' | 'created_by'> {
    created_by: number;
}