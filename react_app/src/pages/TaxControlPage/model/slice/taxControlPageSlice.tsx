import {createSlice, PayloadAction} from "@reduxjs/toolkit";

import {StateSchema} from "app/providers/StoreProvider";
import {department} from "entities/Department";

import {TaxControlData, TaxControlList, taxControlListAdapter, TaxControlSchema} from "../types/TaxControlSchema";
import {fetchTaxControlList} from "../service/fetchTaxControlData/fetchTaxControlData";
import {fetchNextTaxControlData} from "../service/fetchNextTaxControlData/fetchNextTaxControlData";
import {fetchTaxControlCard} from "../service/fetchTaxControlData/fetchTaxControlCard";


export const initialState: TaxControlSchema = {
    results: taxControlListAdapter.getInitialState({
        ids: [],
        entities: {},
    }),
    count: 0,
    previous: null,
    next: null,
    not_relevant_id: [],

    is_loading: false,
    updated: false,

    product_name_filter: '',
    current_view_mode: 'Все тарификации',
    department_filter: {
        name: 'Все отделы',
        number: 0,
        piecework_wages: true,
        single: false
    },
}


export const taxControlSlice = createSlice({
        name: 'taxControl',
        initialState,
        reducers: {
            addNotRelevantId: (state, action: PayloadAction<number>) => {
                state.not_relevant_id = [...state.not_relevant_id, action.payload]
            },
            hasUpdated: (state) => {
                state.updated = !state.updated
            },

            setDepartmentFilter: (state, action: PayloadAction<department>) => {
                state.department_filter = action.payload
            },

            setProductNameFilter: (state, action: PayloadAction<string>) => {
                state.product_name_filter = action.payload
            },

            setViewModes: (state, action: PayloadAction<string[]>) => {
                state.view_modes = action.payload
            },

            setCurrentViewFilter: (state, action: PayloadAction<string>) => {
                state.current_view_mode = action.payload
            },

            setDefaultFilters: (state) => {
                state.current_view_mode = initialState.current_view_mode;
                state.department_filter = initialState.department_filter;
                state.product_name_filter = initialState.product_name_filter;
            },
        },

        extraReducers: (builder) => {
            builder
                // Запрос первоначальный
                .addCase(fetchTaxControlList.pending, (state) => {
                    state.is_loading = true;
                })
                .addCase(fetchTaxControlList.fulfilled, (state, action: PayloadAction<TaxControlList>) => {
                    state.is_loading = false;
                    taxControlListAdapter.setAll(state.results, action.payload.results)
                    state.next = action.payload.next
                    state.previous = action.payload.previous
                    state.count = action.payload.count
                })
                .addCase(fetchTaxControlList.rejected, (state) => {
                    state.is_loading = false;
                })

                // Запросы при пагинации
                .addCase(fetchNextTaxControlData.pending, (state) => {
                    state.is_loading = true;
                })
                .addCase(fetchNextTaxControlData.fulfilled, (state, action: PayloadAction<TaxControlList>) => {
                    state.is_loading = false;
                    taxControlListAdapter.addMany(state.results, action.payload.results)
                    state.next = action.payload.next
                    state.previous = action.payload.previous
                    state.count = action.payload.count
                })
                .addCase(fetchNextTaxControlData.rejected, (state) => {
                    state.is_loading = false;
                })

                // Запросы обновления карточки
                .addCase(fetchTaxControlCard.fulfilled, (state, action: PayloadAction<TaxControlData>) => {
                    taxControlListAdapter.upsertOne(state.results, action.payload);
                    state.not_relevant_id = state.not_relevant_id.filter(
                        (order_product_id) => order_product_id !== action.payload.id);
                })
        }
    }
)

export const {actions: taxControlActions} = taxControlSlice;
export const {reducer: taxControlReducer} = taxControlSlice;

export const getTaxControlList = taxControlListAdapter.getSelectors<StateSchema>(
    state => state.taxControl?.results || taxControlListAdapter.getInitialState());

export const getTaxControlData = (state: StateSchema) => state.taxControl;

