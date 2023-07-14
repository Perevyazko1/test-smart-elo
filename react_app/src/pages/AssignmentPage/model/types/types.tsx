import {normalizedExtendedAssignmentList} from "entities/Assignment";


export interface AssignmentSchema extends normalizedExtendedAssignmentList {
    isLoading: boolean;
    hasUpdated: boolean | undefined;
}