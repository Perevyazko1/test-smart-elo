import {createEntityAdapter} from "@reduxjs/toolkit";
import {assignment, extendedAssignment} from "../type/assignment";


export const assignmentEntityAdapter = createEntityAdapter<assignment>({
    selectId: (assignment) => assignment.id,
});

export const extendedAssignmentEntityAdapter = createEntityAdapter<extendedAssignment>({
    selectId: (extendedAssignment) => extendedAssignment.id,
});