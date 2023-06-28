import {eq_card} from "entities/EqPageCard";

export const createEqNumberLists = (eqCard: eq_card, seriesSize: number) => {
    const primary: number[] = [];
    const secondary: number[] = [];
    const confirmed: number[] = [];
    const assignments = eqCard.assignments

    for (let i = 0; i < assignments.length; i++) {
        const assignment = assignments[i];
        const assignmentNumber = assignment.number;

        if (assignment.inspector) {
            confirmed.push(assignmentNumber)
        } else if (primary.length < seriesSize) {
            primary.push(assignmentNumber)
        } else {
            secondary.push(assignmentNumber);
        }
    }

    return {primary, secondary, confirmed};
}