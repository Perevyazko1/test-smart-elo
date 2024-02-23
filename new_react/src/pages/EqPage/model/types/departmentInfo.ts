export interface DepartmentInfo {
    full_name: string;
    count_in_work: number;
    count_all: number;
}

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

export interface ProductionInfo {
    department_name: string,
    await: number,
    in_work: number,
    ready: number,
    confirmed: number,
}

export interface ResponseProdInfo {
    production_info: ProductionInfo[];
}
