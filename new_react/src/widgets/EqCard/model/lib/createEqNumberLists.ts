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

    // Sort assignments by print_count
    const sortedAssignments = [...assignments].sort((a, b) => {
        if (a.print_count === 0 && b.print_count !== 0) return -1;
        if (a.print_count !== 0 && b.print_count === 0) return 1;
        return 0;
    });

    for (let i = 0; i < sortedAssignments.length; i++) {
        const assignment = sortedAssignments[i];

        if (userId && assignment.executor !== userId) {
            coExecuted.push(assignment);
        } else if (assignment.inspector) {
            confirmed.push(assignment);
        } else if ((primary.length + selectedLocked.length) < seriesSize) {
            if (assignment.assembled) {
                primary.push(assignment);
            } else {
                selectedLocked.push(assignment);
            }
        } else {
            if (assignment.assembled) {
                secondary.push(assignment);
            } else {
                lockedNums.push(assignment);
            }
        }
    }

    // Sort individual arrays to ensure zero print_count items are at the beginning
    const sortArray = (arr: EqAssignment[]) => {
        return arr.sort((a, b) => {
            if (a.print_count === 0 && b.print_count !== 0) return -1;
            if (a.print_count !== 0 && b.print_count === 0) return 1;
            return 0;
        });
    };

    return {
        primary: sortArray(primary),
        secondary: sortArray(secondary),
        coExecuted: sortArray(coExecuted),
        confirmed: sortArray(confirmed),
        lockedNums: sortArray(lockedNums),
        selectedLocked: sortArray(selectedLocked)
    };
}