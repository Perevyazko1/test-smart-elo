
export interface IAgentTag {
    id: number;
    name: string;
}

export interface IAgent {
    name: string;
    id: number;
    tags: IAgentTag[]
}

export interface IPlanDataRow {
    date: string;
    product_name: string;
    product_picture: string;
    order: string;
    series_id: string;
    price: string;
    fabric_name: string;
    fabric_picture: string;
    project: string | null;
    quantity: number;
    shipped: number;
    final_waiting: number;
    assignments: {
        [key: string]: {
            all: number;
            ready: number;
            await: number;
        };
    }
}

export interface IPlanData {
    [key: string]: IPlanDataRow;
}