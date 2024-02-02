import {OrderProduct} from "@entities/OrderProduct";
import {Assignment} from "@entities/Assignment";

import {CardInfo} from "./cardInfo";
import {DepartmentInfo} from "./departmentInfo";
import {createEntityAdapter} from "@reduxjs/toolkit";


export interface EqCardType extends OrderProduct {
    assignments: Assignment[];
    card_info: CardInfo;
    department_info: DepartmentInfo[];
}

export const eqCardEntityAdapter = createEntityAdapter<EqCardType>({
    selectId: (eq_card) => eq_card.series_id,
    sortComparer: (a, b) => {
        const urgencyDiff = a.urgency - b.urgency;
        if (urgencyDiff !== 0) {
            return urgencyDiff;
        }

        const orderNumberDiff = a.order.id - b.order.id;
        if (orderNumberDiff !== 0) {
            return orderNumberDiff;
        }

        return a.id - b.id;
    },
})
