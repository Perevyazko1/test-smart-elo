import { assignment } from "entities/Assignment";

type Status = 'in_work' | 'await' | 'ready' | 'created';
type AssignmentList = Record<Status, assignment[]>;

export const distributeAssignments = (assignments: assignment[]): AssignmentList =>
  assignments.reduce<AssignmentList>((acc, assignment) => {
    const { status } = assignment;

    if (!acc[status]) {
      acc[status] = [];
    }

    acc[status].push(assignment);

    return acc;
  }, {
    in_work: [],
    await: [],
    ready: [],
    created: [],
  } as AssignmentList);
