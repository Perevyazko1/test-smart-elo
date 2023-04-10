export interface product_picture {
    id: number;
    image_filename: string;
    image: string;
    product: number;

}


export interface product {
    name: string;
    product_pictures: product_picture[];
    technological_process_confirmed: number | null;
}

export interface fabric {
    id: number;
    fabric_id: string;
    name: string;
    image_filename: string;
    image: string;
}

export interface order {
    project: string;
}

export interface assignment {
    number: number;
    notes: string;
    status: string;
    department: number;
    executor: number | null;
    inspector: number | null;
}


export interface order_product {
    series_id: string;
    product: product;
    main_fabric: fabric;
    second_fabric: fabric;
    third_fabric: fabric;
    order: order;
    urgency: number;
    comment_base: string;
    comment_case: string;
    assignments: assignment[];
    tax: number;
    count_all: number;
    count_in_work: number;
    count_ready: number;
    count_await: number;
}

export interface order_product_list {
    count?: number;
    next?: string | null;
    previous?: string | null;
    results?: order_product[];
}