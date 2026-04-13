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

export interface ISimpleComment {
    id: number;
    text: string;
    add_date: string;
}

export interface IPlanDataRow {
    date: string;
    product_id: number;
    product_name: string;
    product_picture: string;
    order: string;
    order_id: number;
    series_id: string;
    order_product_id: number;
    price: string;
    fabric_name: string;
    fabric_picture: string;
    fabric_stock: number | null;
    project: string | null;
    agent_name: string | null;
    agent_id: number | null;
    quantity: number;
    all_quantity: number;
    shipped: number;
    urgency: 1 | 2 | 3;
    final_waiting: number;
    comments: IPlanComment[];
    order_comments: ISimpleComment[];
    agent_comments: ISimpleComment[];
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
