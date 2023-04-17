import {order_product} from "entities/OrderProduct";

export const createNumberLists = (order_product: order_product, series_size: number) => {
    const primary: number[] = [];
    const secondary: number[] = [];
    const confirmed: number[] = [];
    const assignments = order_product.assignments

    for (let i = 0; i < assignments.length; i++) {
        const assignment = assignments[i];
        const assignmentNumber = assignment.number;

        if (assignment.inspector) {
            confirmed.push(assignmentNumber)
        } else if (primary.length < series_size) {
            primary.push(assignmentNumber)
        } else {
            secondary.push(assignmentNumber);
        }
    }

    return {primary, secondary, confirmed};
}