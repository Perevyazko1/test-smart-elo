import {technological_process} from "entities/TechnologicalProcess";
import {employee} from "entities/Employee";
import {product_picture} from "entities/ProductPicture";

export interface product {
    id: string;
    name: string;
    product_pictures: product_picture[] | undefined;
    technological_process: technological_process | undefined;
    technological_process_confirmed: employee | null;
}