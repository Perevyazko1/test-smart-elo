import {order_product} from "entities/OrderProduct";

export const createNumberLists = (order_product: order_product, series_size: number) => {
    const primary: number[] = [];
    const secondary: number[] = [];
    const assignments = order_product.assignments

    for (let i = 0; i < assignments.length; i++) {
        const assignment = assignments[i];
        const assignmentsNumber = assignment.number;

        // If the target series number is odd, add the task to the primary list; otherwise, add it to the secondary list.
        if (i > series_size) {
            secondary.push(assignmentsNumber);
        } else {
            primary.push(assignmentsNumber);
        }
    }

    return {primary, secondary};
}