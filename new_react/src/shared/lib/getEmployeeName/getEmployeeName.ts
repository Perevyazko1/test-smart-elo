import {Employee} from "@entities/Employee";

export const getEmployeeName = (employee: Employee | undefined | null): string => {
    if (!employee) {
        return ''
    }

    return `${employee.first_name || ''} ${employee.last_name}`
}