export interface ProductionInfo {
    department_name: string,
    in_work: number,
    ready: number,
    confirmed: number,
}

export interface ResponseProdInfo {
    production_info: ProductionInfo[];
}
