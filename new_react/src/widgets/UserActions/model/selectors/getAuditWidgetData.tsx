import {StateSchema} from "@app";

export const getAuditWidgetData = (state: StateSchema) => state.auditWidget?.data;
export const getAuditWidgetIsLoading = (state: StateSchema) => state.auditWidget?.is_loading;