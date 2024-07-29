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
    assembled: number,
    in_work: number,
    ready: number,
    confirmed: number,
}

export interface ResponseProdInfo {
    production_info: ProductionInfo[];
}
