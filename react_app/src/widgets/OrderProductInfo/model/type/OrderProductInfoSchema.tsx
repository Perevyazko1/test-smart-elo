import {technological_process} from "entities/OrderProduct";

export interface OrderProductInfoSchema {
    tech_process_list?: technological_process[],
    current_tech_process?: technological_process
}