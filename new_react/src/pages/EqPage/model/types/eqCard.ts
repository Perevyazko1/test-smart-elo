import {OrderProduct} from "@entities/OrderProduct";
import {Assignment} from "@entities/Assignment";

import {CardInfo} from "./cardInfo";
import {DepartmentInfo} from "./departmentInfo";


export interface EqCard extends OrderProduct {
    assignments: Assignment[];
    card_info: CardInfo;
    department_info: DepartmentInfo[];
}