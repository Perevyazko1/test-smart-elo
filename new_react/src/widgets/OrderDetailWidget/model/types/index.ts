import {Employee} from "@entities/Employee";


interface OrderReadyInfo {
    in_work: number;
    all: number;
    ready: number;
}

export interface OrderItem {
    id: number;
    number: string;
    moment: string;
    project: string;
    planned_date: string;
    urgency: number;
    inner_number: string;
    status: string;
}


interface DepartmentInfo {
    [key: string]: {
        await: number;
        created: number;
        in_work: number;
        ready: number;
    }
}


export interface OpComment {
    id: string;
    author: Employee;
    order_product: number;
    important: boolean;
    add_date: string;
    deleted: boolean;
    text: string;
}


export interface OrderProduct {
    id: number;
    series_id: string;
    product_name: string;
    product_image_url: string;
    quantity: number;
    status: "0" | "1";
    urgency: number;
    departments_info: DepartmentInfo;
    op_comments: OpComment[];
}


export interface OrderDetails extends OrderItem {
    comment_case: string;
    comment_base: string;
    order_products: OrderProduct[];
    order_ready_info: OrderReadyInfo;
}

export interface OrderDetailsSchema {
    data: OrderDetails | null;
    isLoading: boolean;
    hasUpdated: boolean;
}
