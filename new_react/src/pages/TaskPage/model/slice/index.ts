import {createSlice} from "@reduxjs/toolkit";

import {TaskStatus} from "@entities/Task";

import {TaskPageSchema} from "../types";
import {getTaskCards} from "../api/getTaskCards";
import {updateTask} from "../api/updateTask";
import {getTaskCard} from "../api/getTaskCard";
import {getWeekData} from "../api/getWeekData";

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
        viewModeInited: (state, action) => {
            state.viewModeInited = action.payload;
        },
        sortModeInited: (state, action) => {
            state.sortModeInited = action.payload;
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
                const updateList = (list: typeof state.await.results, status: TaskStatus[]) => {
                    const index = list.findIndex(item => item.id === action.payload.id);
                    if (index !== -1 && status.includes(action.payload.status)) {
                        list[index] = action.payload;
                    } else if (status.includes(action.payload.status)) {
                        return [...list, action.payload];
                    } else {
                        return list.filter(item => item.id !== action.payload.id);
                    }
                    return list;
                };

                state.await.results = updateList(state.await.results, [TaskStatus.Pending]);
                state.inWork.results = updateList(state.inWork.results, [TaskStatus.InProgress]);
                state.ready.results = updateList(state.ready.results, [TaskStatus.Completed, TaskStatus.Cancelled]);

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
