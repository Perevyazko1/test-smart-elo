


export interface PlanDataRow {
    date: string;
    product_name: string;
    product_picture: string;
    order: string;
    series_id: string;
    price: number;
    fabric_name: string;
    fabric_picture: string;
    project: string | null;
    quantity: number;
    shipped: number;
    assignments: {
        [key: string]: {
            all: number;
            ready: number;
        };
    }
}

export interface PlanData {
    [key: string]: PlanDataRow;
}