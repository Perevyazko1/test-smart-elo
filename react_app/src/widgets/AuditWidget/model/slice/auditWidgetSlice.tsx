import {createSlice, PayloadAction} from "@reduxjs/toolkit";

import {AuditWidgetData, AuditWidgetSchema} from "../type/AuditWidgetSchema";
import {fetchAuditList} from "../service/fetchAuditWidget";


export const initialState: AuditWidgetSchema = {
    is_loading: false
}


export const eqSlice = createSlice({
        name: 'auditWidget',
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
                    // state.error = undefined;
                })
                .addCase(fetchAuditList.fulfilled, (state) => {
                    state.is_loading = false;
                })
                .addCase(fetchAuditList.rejected, (state, action) => {
                    state.is_loading = false;
                    // state.error = action.payload;
                })

        }
    }
)

export const {actions: auditWidgetActions} = eqSlice;
export const {reducer: auditWidgetReducer} = eqSlice;

