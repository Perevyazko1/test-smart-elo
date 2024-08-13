import {TaskPageSchema} from "@pages/TaskPage/model/types";
import {createSlice} from "@reduxjs/toolkit";
import {getTaskCards} from "@pages/TaskPage/model/api/getTaskCards";
import {TaskStatus} from "@pages/TaskPage";
import {updateTask} from "@pages/TaskPage/model/api/updateTask";
import {getTaskCard} from "@pages/TaskPage/model/api/getTaskCard";
import {getWeekData} from "@pages/TaskPage/model/api/getWeekData";

export const initialState: TaskPageSchema = {
    week_data: null,
    viewModeInited: false,
    sortModeInited: false,
    await: {
        isLoading: true,
        hasUpdated: false,
        count: 0,
        next: null,
        previous: null,
        results: [],
    },
    inWork: {
        isLoading: true,
        hasUpdated: false,
        count: 0,
        next: null,
        previous: null,
        results: [],
    },
    ready: {
        isLoading: true,
        hasUpdated: false,
        count: 0,
        next: null,
        previous: null,
        results: [],
    },
    noRelevantIds: [],
}


const taskPageSlice = createSlice({
    name: 'taskPageSlice',
    initialState,
    reducers: {
        addNoRelevantId: (state, action) => {
            state.noRelevantIds = [...state.noRelevantIds, action.payload];
        },
        viewModeInited: (state) => {
            state.viewModeInited = true;
        },
        sortModeInited: (state) => {
            state.sortModeInited = true;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getTaskCards.pending, (state, action) => {
                if (action.meta.arg.status === TaskStatus.Pending) {
                    state.await.isLoading = true;
                } else if (action.meta.arg.status === TaskStatus.InProgress) {
                    state.inWork.isLoading = true;
                } else {
                    state.ready.isLoading = true;
                }
            })
            .addCase(getTaskCards.fulfilled, (state, action) => {
                if (action.meta.arg.status === TaskStatus.Pending) {
                    state.await.results = action.payload;
                    state.await.isLoading = false;
                } else if (action.meta.arg.status === TaskStatus.InProgress) {
                    state.inWork.results = action.payload;
                    state.inWork.isLoading = false;
                } else {
                    state.ready.results = action.payload;
                    state.ready.isLoading = false;
                }
            })
            .addCase(getTaskCards.rejected, (state, action) => {
                if (action.meta.arg.status === TaskStatus.Pending) {
                    state.await.isLoading = true;
                } else if (action.meta.arg.status === TaskStatus.InProgress) {
                    state.inWork.isLoading = true;
                } else {
                    state.ready.isLoading = true;
                }
            })

            .addCase(updateTask.fulfilled, (state, action) => {
                state.await.results = state.await.results.filter(item => item.id !== action.payload.id)
                state.inWork.results = state.inWork.results.filter(item => item.id !== action.payload.id)
                state.ready.results = state.ready.results.filter(item => item.id !== action.payload.id)

                if (action.payload.status === TaskStatus.Pending) {
                    state.await.results = [...state.await.results, action.payload];
                } else if (action.payload.status === TaskStatus.InProgress) {
                    state.inWork.results = [...state.inWork.results, action.payload];
                } else {
                    state.ready.results = [...state.ready.results, action.payload];
                }
                state.noRelevantIds = state.noRelevantIds.filter(item => item !== action.payload.id);
            })

            .addCase(getTaskCard.fulfilled, (state, action) => {
                const updateList = (list: typeof state.await.results) => {
                    const index = list.findIndex(item => item.id === action.payload.id);
                    if (index !== -1) {
                        list[index] = action.payload;
                    } else {
                        return list.filter(item => item.id !== action.payload.id);
                    }
                    return list;
                };

                state.await.results = updateList(state.await.results);
                state.inWork.results = updateList(state.inWork.results);
                state.ready.results = updateList(state.ready.results);

                state.noRelevantIds = state.noRelevantIds.filter(item => item !== action.payload.id);
            })

            .addCase(getTaskCard.rejected, (state, action) => {
                state.await.results = state.await.results.filter(item => item.id !== action.meta.arg.id)
                state.inWork.results = state.inWork.results.filter(item => item.id !== action.meta.arg.id)
                state.ready.results = state.ready.results.filter(item => item.id !== action.meta.arg.id)

                state.noRelevantIds = state.noRelevantIds.filter(item => item !== action.meta.arg.id);
            })

            .addCase(getWeekData.pending, () => {
            })
            .addCase(getWeekData.fulfilled, (state, action) => {
                state.week_data = action.payload;
            })
            .addCase(getWeekData.rejected, () => {
            })
    },
});


export const {actions: taskPageActions} = taskPageSlice;
export const {reducer: taskPageReducer} = taskPageSlice;
