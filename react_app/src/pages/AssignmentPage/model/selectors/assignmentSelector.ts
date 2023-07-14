import {StateSchema} from "app/providers/StoreProvider";
import {extendedAssignmentEntityAdapter} from "entities/Assignment";

import {AssignmentSchema} from "../types/types";

export const getAssignmentList = extendedAssignmentEntityAdapter.getSelectors<StateSchema>(
    state => state.assignments?.results || extendedAssignmentEntityAdapter.getInitialState()
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