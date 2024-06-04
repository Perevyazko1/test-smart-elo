import {createSlice} from "@reduxjs/toolkit";
import {PostTarifficationSchema} from "@widgets/PostTarifficationWidget/model/types";
import {fetchPostTarifficationData} from "@widgets/PostTarifficationWidget/model/api/fetchPostTarifficationData";
import {fetchSetPostTariffication} from "@widgets/PostTarifficationWidget/model/api/fetchSetPostTariffication";


export const initialState: PostTarifficationSchema = {
    isLoading: true,
    hasUpdated: false,
};


const postTarifficationWidgetSlice = createSlice({
    name: 'postTarifficationWidgetSlice',
    initialState,
    reducers: {
        listHasUpdated: (state) => {
            state.hasUpdated = !state.hasUpdated;
        },
    },

    extraReducers: (builder) => {
        builder
            .addCase(fetchPostTarifficationData.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchPostTarifficationData.fulfilled, (state, action) => {
                state.data = action.payload;
                state.isLoading = false;
            })
            .addCase(fetchPostTarifficationData.rejected, (state) => {
                state.isLoading = false;
            })

            .addCase(fetchSetPostTariffication.pending, (state) => {
            })
            .addCase(fetchSetPostTariffication.fulfilled, (state, action) => {
            })
            .addCase(fetchSetPostTariffication.rejected, (state) => {
            })
    },
});

export const {reducer: postTarifficationWidgetReducer} = postTarifficationWidgetSlice;
