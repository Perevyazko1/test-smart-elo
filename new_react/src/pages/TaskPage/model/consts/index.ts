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
