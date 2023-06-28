import {createEntityAdapter} from "@reduxjs/toolkit";
import {eq_card} from "../types/eq_page_card";


export const eqPageCardEntityAdapter = createEntityAdapter<eq_card>({
    selectId: (eq_card) => eq_card.series_id,
    sortComparer: (a, b) => {
        const urgencyDiff = a.urgency - b.urgency;
        if (urgencyDiff !== 0) {
            return urgencyDiff;
        }

        const orderNumberDiff = a.order.number - b.order.number;
        if (orderNumberDiff !== 0) {
            return orderNumberDiff;
        }

        return a.id - b.id;
    },
})
