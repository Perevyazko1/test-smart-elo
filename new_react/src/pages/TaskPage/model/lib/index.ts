import {TaskStatus, TaskUrgency, TaskViewMode} from "../consts";


export const getStatusText = (status: TaskStatus): string => {
    switch (status) {
        case TaskStatus.Pending:
            return 'Ожидает';
        case TaskStatus.InProgress:
            return 'В работе';
        case TaskStatus.Completed:
            return 'Готова';
        case TaskStatus.Cancelled:
            return 'Отменена';
        default:
            return 'Неизвестный статус';
    }
};

export const getUrgencyText = (urgency: TaskUrgency): string => {
    switch (urgency) {
        case TaskUrgency.Low:
            return 'Низкая';
        case TaskUrgency.Normal:
            return 'Обычная';
        case TaskUrgency.Important:
            return 'Важная';
        case TaskUrgency.Urgent:
            return 'Горящая';
        default:
            return 'Неизвестная срочность';
    }
};


export const getViewModeText = (view_mode: TaskViewMode): string => {
    switch (view_mode) {
        case TaskViewMode.OnlyMe:
            return 'Только мне';
        case TaskViewMode.DepartmentVisible:
            return 'Видна отделам';
        case TaskViewMode.EveryoneVisible:
            return 'Видна всем';
        case TaskViewMode.ForParticipants:
            return 'Исполнителям';
        default:
            return 'Ошибка';
    }
};