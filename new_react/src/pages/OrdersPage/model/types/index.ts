export interface OrderItem {
    id: number;
    number: string;
    moment: string;
    project: string;
    planned_date: string;
    urgency: number;
    inner_number: string;
    status: "1" | "0";
}

export interface OrdersListApi {
    results: OrderItem[];
    next: string | null;
    previous: string | null;
    count: number;
}

export interface OrdersPageSchema {
    results: OrderItem[];
    count: number;
    isLoading: boolean;
    hasUpdated: boolean;
    next: string | null;
    previous: string | null;
}