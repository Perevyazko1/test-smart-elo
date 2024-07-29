import {EqAssignment} from "@widgets/EqCardList/model/types";

export interface EqNumberListTipe {
    primary: number[];
    secondary: number[];
    lockedNums: number[];
    selectedLocked: number[];
    confirmed: number[];
}

export const createEqNumberLists = (assignments: EqAssignment[], seriesSize: number) => {
    const primary: number[] = [];
    const secondary: number[] = [];
    const lockedNums: number[] = [];
    const selectedLocked: number[] = [];
    const confirmed: number[] = [];

    for (let i = 0; i < assignments.length; i++) {
        const assignment = assignments[i];
        const assignmentNumber = assignment.number;

        if (assignment.inspector) {
            confirmed.push(assignmentNumber)
        } else if ((primary.length + selectedLocked.length) < seriesSize) {
            if (assignment.assembled) {
                primary.push(assignmentNumber)
            } else {
                selectedLocked.push(assignmentNumber)
            }
        } else {
            if (assignment.assembled) {
                secondary.push(assignmentNumber);
            } else {
                lockedNums.push(assignmentNumber)
            }

        }
    }

    return {primary, secondary, confirmed, lockedNums, selectedLocked};
}