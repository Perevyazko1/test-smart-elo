import {assignment} from "entities/Assignment";

export const createEqNumberLists = (assignments: assignment[], seriesSize: number) => {
    const primary: number[] = [];
    const secondary: number[] = [];
    const confirmed: number[] = [];

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