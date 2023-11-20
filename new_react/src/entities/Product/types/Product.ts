import {Employee} from "@entities/Employee";
import {ProductPicture} from "@entities/ProductPicture";
import {TechProcess} from "@entities/TechProcess";

export interface BaseProduct {
    id: number;
    name: string;
    product_pictures: number[] | null;
    technological_process: number | null;
    technological_process_confirmed: number | null;
}

type ExtendedFields = 'product_pictures' | 'technological_process' | 'technological_process_confirmed';

export interface Product extends Omit<BaseProduct, ExtendedFields> {
    technological_process_confirmed: Employee;
    product_pictures: ProductPicture[];
    technological_process: TechProcess;
}
