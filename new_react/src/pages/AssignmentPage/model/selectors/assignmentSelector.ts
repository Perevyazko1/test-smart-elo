import {StateSchema} from "@app";

import {AssignmentSchema} from "../types/types";
import {AssignmentAdapter} from "@entities/Assignment/adapter/adapter";

export const getAssignmentList = AssignmentAdapter.getSelectors<StateSchema>(
    state => state.assignments?.results || AssignmentAdapter.getInitialState()
);

export const getAssignmentProps = (state: StateSchema): Omit<AssignmentSchema, 'results'> => {
    return {
        next: state.assignments?.next || null,
        previous: state.assignments?.previous || null,
        count: state.assignments?.count || 0,
        isLoading: state.assignments?.isLoading !== undefined ? state.assignments?.isLoading : true,
        hasUpdated: state.assignments?.hasUpdated,
    };
};