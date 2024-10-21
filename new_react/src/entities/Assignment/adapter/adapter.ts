import {createEntityAdapter} from "@reduxjs/toolkit";
import {Assignment} from "@entities/Assignment";

export const AssignmentAdapter = createEntityAdapter<Assignment, number>({
    selectId: (assignment) => assignment.id,
});