export interface IStep {
    id: number;
    amount: number;
    proposed_amount: number;
}


export interface IRow {
    id: number;
    product: string;
    confirmed: boolean;
    series_id: string;
    project: string;
    image: string | null;
    amount: number;
    quantity: number;
    fabric: string | null;
    steps: {
        [key: string]: IStep | null;
    }
}

export type TariffRowsResponse = {
    result: IRow[];
    departments: string[];
}