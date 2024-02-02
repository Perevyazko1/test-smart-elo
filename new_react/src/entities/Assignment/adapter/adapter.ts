import {createEntityAdapter} from "@reduxjs/toolkit";
import {Assignment} from "@entities/Assignment";

export const AssignmentAdapter = createEntityAdapter<Assignment>({
    selectId: (assignment) => assignment.id,
});