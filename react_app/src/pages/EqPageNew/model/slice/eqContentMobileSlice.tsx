import {EqListData} from "../types/eqPageSchema";
import {createSlice} from "@reduxjs/toolkit";
import {fetchListData} from "../service/fetchListData";
import {eqPageCardEntityAdapter} from "../../../../entities/EqPageCard";
import {fetchEqUpdateCard} from "../service/fetchEqUpdateCard";

const initialState: EqListData = {
    results: {
        ids: [],
        entities: {},
    },
    count: 0,
    isLoading: false,
    hasUpdated: false,
    next: null,
    previous: null,
}


const eqContentMobileSlice = createSlice({
    name: 'eqContentMobileSlice',
    initialState,
    reducers: {
        listHasUpdated: (state) => {
            state.hasUpdated = !state.hasUpdated;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchListData.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchListData.fulfilled, (state, action) => {
                const {results, ...props} = action.payload;
                if (action.meta.arg.url) {
                    eqPageCardEntityAdapter.addMany(state.results, results)
                } else {
                    eqPageCardEntityAdapter.setAll(state.results, results)
                }
                state.next = props.next;
                state.count = props.count;
                state.previous = props.previous;
                state.isLoading = false;
            })
            .addCase(fetchListData.rejected, (state) => {
                state.isLoading = false;
            })

            .addCase(fetchEqUpdateCard.fulfilled, (state, action) => {
                console.log(action.payload)
                if (action.payload.mobile.assignments.length === 0 && action.payload.mobile.card_info.count_in_work === 0) {
                    eqPageCardEntityAdapter.removeOne(state.results, action.payload.mobile.series_id)
                } else {
                    eqPageCardEntityAdapter.upsertOne(state.results, action.payload.mobile)
                }
            })
    },
});

export const {reducer: eqContentMobileReducer} = eqContentMobileSlice;
export const {actions: eqContentMobileActions} = eqContentMobileSlice;
