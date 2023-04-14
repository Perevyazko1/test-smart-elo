import {order_product} from "entities/OrderProduct";

export const createNumberLists = (order_product: order_product, series_size: number) => {
    const primary: number[] = [];
    const secondary: number[] = [];
    const assignments = order_product.assignments

    for (let i = 0; i < assignments.length; i++) {
        const assignment = assignments[i];
        const assignmentsNumber = assignment.number;

        if (i < series_size) {
            primary.push(assignmentsNumber);
        } else {
            secondary.push(assignmentsNumber);
        }
    }

    return {primary, secondary};
}