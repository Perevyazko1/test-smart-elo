import {Fabric} from "@entities/Fabric";
import {Order} from "@entities/Order";
import {Product} from "@entities/Product";
import {Tariff} from "@entities/Tariff";

export interface BaseOrderProduct {
    id: number;
    series_id: string;
    product: number;
    main_fabric: number;
    second_fabric: number;
    third_fabric: number;
    order: number;
    urgency: number;
    comment_base: string;
    comment_case: string;
    tariff: number;
    further_packaging: boolean;
}

type ExtendedFields = 'product' | 'main_fabric' | 'second_fabric' | 'third_fabric' | 'order' | 'tariff';

export interface OrderProduct extends Omit<BaseOrderProduct, ExtendedFields> {
    product: Product;
    main_fabric: Fabric | null;
    second_fabric: Fabric | null;
    third_fabric: Fabric | null;
    order: Order;
}