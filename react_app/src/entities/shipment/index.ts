export interface IOrderProduct {
    id: number;
    series_id: string;
    status: string;
    product: {
        name: string;
        product_pictures:
            {
                id: number;
                image: string | null;
                thumbnail: string | null;
            }[];
    };
    order: {
        id: number;
        project: string;
        moment: string;
        number: string;
        planned_date: string;
        agent: {
            id: number;
            name: string;
            tags: { id: string; name: string }[];
        };
        owner: string;
    };
    main_fabric?: {
        name: string;
        fabric_pictures:
            {
                id: number;
                image: string | null;
                thumbnail: string | null;
            }[];
    };
    second_fabric?: {
        name: string;
        fabric_pictures:
            {
                id: number;
                image: string | null;
                thumbnail: string | null;
            }[];
    };
    third_fabric?: {
        name: string;
        fabric_pictures:
            {
                id: number;
                image: string | null;
                thumbnail: string | null;
            }[];
    };
    quantity: number;
    shipment: number;
    price: number;
    urgency: number;
}


export interface IShipmentItem {
    id: number;
    number: number;
    is_reserved: boolean;
    reserver_id: number | null;
    reserved_at: string | null;
    is_checked: boolean;
    checked_at: string | null;
}

export interface IShipmentRow {
    id: number;
    order_product: IOrderProduct;
    quantity: number;
    items: IShipmentItem[];
}

export interface IShipmentComment {
    id: number;
    author: number;
    comment: string;
    add_date: string;
}

export interface IShipment {
    id: number;
    status: string;
    plan_date: string;
    comment: string;
    created_at: string;
    created_by: number;
    rows: IShipmentRow[];
    shipment_comments: IShipmentComment[];
}