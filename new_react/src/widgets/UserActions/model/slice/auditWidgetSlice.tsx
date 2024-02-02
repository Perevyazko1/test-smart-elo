import {createSlice, PayloadAction} from "@reduxjs/toolkit";

import {AuditWidgetData, AuditWidgetSchema} from "../type/AuditWidgetSchema";
import {fetchAuditList} from "../service/fetchAuditWidget";


export const initialState: AuditWidgetSchema = {
    is_loading: false
}


export const auditSlice = createSlice({
        name: 'auditSlice',
        initialState,
        reducers: {
            setAuditWidgetData: (state, action: PayloadAction<AuditWidgetData[]>) => {
                state.data = action.payload
            },
        },
        extraReducers: (builder) => {
            builder
                .addCase(fetchAuditList.pending, (state) => {
                    state.is_loading = true;
                })
                .addCase(fetchAuditList.fulfilled, (state) => {
                    state.is_loading = false;
                })
                .addCase(fetchAuditList.rejected, (state, action) => {
                    state.is_loading = false;
                })

        }
    }
)

export const {actions: auditWidgetActions} = auditSlice;
export const {reducer: auditWidgetReducer} = auditSlice;

