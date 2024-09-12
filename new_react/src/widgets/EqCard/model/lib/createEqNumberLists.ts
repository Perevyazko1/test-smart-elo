import {EqAssignment} from "@widgets/EqCardList/model/types";

export interface EqNumberListTipe {
    primary: EqAssignment[];
    secondary: EqAssignment[];
    lockedNums: EqAssignment[];
    selectedLocked: EqAssignment[];
    confirmed: EqAssignment[];
    coExecuted: EqAssignment[];
}

export const createEqNumberLists = (assignments: EqAssignment[],
                                    seriesSize: number,
                                    userId: number | undefined): EqNumberListTipe => {
    const primary: EqAssignment[] = [];
    const secondary: EqAssignment[] = [];
    const coExecuted: EqAssignment[] = [];
    const lockedNums: EqAssignment[] = [];
    const selectedLocked: EqAssignment[] = [];
    const confirmed: EqAssignment[] = [];

    for (let i = 0; i < assignments.length; i++) {
        const assignment = assignments[i];

        if (userId && assignment.executor !== userId) {
            coExecuted.push(assignment)
        } else if (assignment.inspector) {
            confirmed.push(assignment)
        } else if ((primary.length + selectedLocked.length) < seriesSize) {
            if (assignment.assembled) {
                primary.push(assignment)
            } else {
                selectedLocked.push(assignment)
            }
        } else {
            if (assignment.assembled) {
                secondary.push(assignment);
            } else {
                lockedNums.push(assignment)
            }

        }
    }

    return {primary, secondary, coExecuted, confirmed, lockedNums, selectedLocked};
}