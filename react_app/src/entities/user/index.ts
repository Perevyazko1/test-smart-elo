export const APP_PERM = {
    ANON: 'Анонимный пользователь',
    ADMIN: 'Администраторы',

    ELO_PAGE: 'Страница ЭЛО',
    ELO_VIEW_ONLY: 'ЭЛО наблюдатель',
    ELO_BOSS_VIEW_MODE: 'Режим просмотра бригадира',
    ELO_CONFIRM_ASSIGNMENT: 'Визирование нарядов',
    BEHALF_ACTIONS: 'Действия от имени сотрудников отдела',

    TARIFFICATION_PAGE: 'Страница тарификаций',
    TARIFFICATION_BILLING: 'Первичная тарификация',
    TARIFFICATION_CONFIRM: 'Подтверждение тарификаций',

    WAGES_PAGE: 'ЗП - Страница',
    WAGES_ADD_TRANSACTION: 'ЗП - Создание начислений',
    WAGES_CONFIRM_TRANSACTION: 'ЗП - Визирование',
    WAGES_DELETE_TRANSACTION: 'ЗП - Удаление',

    ASSIGNMENT_PAGE: 'Страница нарядов',
    ASSIGNMENT_UNCONFIRMED: 'Снятие визы',

    PRODUCT_PAGE: 'Страница товаров',
    KPI_PAGE: 'Страница KPI',

    SPECIFICATIONS_PAGE: 'Страница спецификаций',

    CHANGE_TECH_PROCESS: 'Изменение техпроцессов',

    TASK_PAGE: 'Страница задач'
} as const

export type TAppPerm = (typeof APP_PERM)[keyof typeof APP_PERM];

export interface IGroup {
    name: TAppPerm;
}


export interface IUser {
    id?: number;
    first_name: string;
    last_name: string;
    patronymic: string;
    username: string;
    departments: string;
    description: string;
    boss: string;
    current_department: number;
    permanent_department: number;
    pin_code: string;
    attention: boolean;
    is_active: boolean;
    groups: IGroup[],
    piecework_wages: boolean;
    piecework_amount: number | null;
    token: string;
}