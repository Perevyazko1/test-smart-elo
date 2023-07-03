export interface DepInfo {
    id: number,
    full_name: string,
    in_work: number,
    ready: number,
    confirmed: number,
}

export interface ResponseDepInfo {
    department_info: DepInfo[];
}
