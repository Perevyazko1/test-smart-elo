import {NorAssignmentList} from "@entities/Assignment";

export interface AssignmentSchema extends NorAssignmentList {
    isLoading: boolean;
    hasUpdated: boolean;
}
