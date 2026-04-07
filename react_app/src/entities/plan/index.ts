export interface IAgentTag {
    id: number;
    name: string;
}

export interface IAgent {
    name: string;
    id: number;
    tags: IAgentTag[]
}

export interface IPlanComment {
    id: number;
    author: number;
    order_product: number;
    important: boolean;
    add_date: string;
    deleted: boolean;
    text: string;
}

export interface IPlanDataRow {
    date: string;
    product_id: number;
    product_name: string;
    product_picture: string;
    order: string;
    series_id: string;
    price: string;
    fabric_name: string;
    fabric_picture: string;
    fabric_stock: number | null;
    project: string | null;
    quantity: number;
    all_quantity: number;
    shipped: number;
    urgency: 1 | 2 | 3;
    final_waiting: number;
    comments: IPlanComment[];
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
