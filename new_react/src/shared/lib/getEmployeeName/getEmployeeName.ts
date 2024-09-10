import {Employee} from "@entities/Employee";

export type EmployeeNameVariants = 'short' | 'full' | 'nameLastName' | 'initials' | 'shortName' | 'listNameInitials';

export const getEmployeeName = (employee: Employee | undefined | null, variant: EmployeeNameVariants = 'nameLastName'): string => {
    if (!employee) {
        return ''
    } else if (variant === 'nameLastName') {
        return `${employee.first_name || ''} ${employee.last_name}`
    } else if (variant === 'initials') {
        return `${employee.last_name?.slice(0, 1) || ""}${employee.first_name?.slice(0, 1) || ''}${employee.patronymic?.slice(0, 1) || ''}`
    } else if (variant === 'short') {
        if (employee.last_name) {
            return `${employee.last_name || ""} ${employee.first_name?.slice(0, 1) || ''}. `
        } else {
            return `${employee.first_name}`
        }
    } else if (variant === 'shortName') {
        if (employee.last_name) {
            return `${employee.first_name || ""} ${employee.last_name?.slice(0, 1) || ''}. `
        } else {
            return `${employee.first_name}`
        }
    } else if (variant === 'listNameInitials') {
        return `${employee.last_name || ""} ${employee.first_name || ''} (${employee.last_name?.slice(0, 1) || ""}${employee.first_name?.slice(0, 1) || ''}${employee.patronymic?.slice(0, 1) || ''})`

    } else {
        return `${employee.last_name || ""} ${employee.first_name || ''} ${employee.patronymic || ""}`
    }
}