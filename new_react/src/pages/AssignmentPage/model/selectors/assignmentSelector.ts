import {createSelector} from 'reselect';

import {StateSchema} from "@app";
import {AssignmentAdapter} from "@entities/Assignment/adapter/adapter";

export const getAssignmentList = AssignmentAdapter.getSelectors<StateSchema>(
    state => state.assignments?.results || AssignmentAdapter.getInitialState()
);

export const getAssignmentProps = createSelector(
  (state: StateSchema) => state.assignments,
  (assignments) => ({
    next: assignments?.next,
    previous: assignments?.previous,
    count: assignments?.count,
    isLoading: assignments?.isLoading,
    hasUpdated: assignments?.hasUpdated,
  })
);