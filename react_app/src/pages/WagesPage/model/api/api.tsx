import {rtkAPI} from "shared/api/rtkAPI";
import {AssignmentsCounter, WagesList, WagesWeekInfo} from "../types/types";
import {Transaction} from "entities/Transaction";

interface GetWagesListProps {
}

interface GetWagesWeekInfoProps {
    employee__id: number;
}

interface GetTransactionProps {
    employee: number,
    add_date: string,
}

interface CreateTransactionProps {
    transactionData: Transaction;
}

interface GetAssignmentsCount {
    employee__id: number,
    date_from: string,
    date_by: string,
}

const WagesApi = rtkAPI.injectEndpoints({
        endpoints: (build) => ({
                getWagesList: build.query<WagesList, GetWagesListProps>({
                    query: (props: GetWagesListProps) => ({
                        url: '/staff/wages_list/',
                        params: {
                            ...props,
                            ordering: 'first_name',
                        }
                    }),
                    providesTags: (result) => [{type: 'WagesList', id: 'WagesList'}]
                }),
                getWagesWeekInfo: build.query<WagesWeekInfo, GetWagesWeekInfoProps>({
                    query: (props: GetWagesWeekInfoProps) => ({
                        url: '/staff/get_wages_week_info/',
                        params: {
                            ...props
                        }
                    }),
                    providesTags: (result) => result ? [{type: 'WagesWeekInfo', id: "WagesWeekInfo"}] : [],
                }),
                getTransaction: build.query<Transaction[], GetTransactionProps>({
                    query: (props: GetTransactionProps) => ({
                        url: '/staff/transactions/',
                        params: {
                            ...props,
                            ordering: '-inspector',
                        }
                    }),
                    providesTags: (result?: Transaction[]) =>
                        result ? [{type: 'Transaction', id: 'ALL'}]: [],
                }),
                createTransaction: build.mutation<Transaction, CreateTransactionProps>({
                    query: (props: CreateTransactionProps) => ({
                        url: '/staff/transactions/',
                        method: 'POST',
                        body: props.transactionData,
                    }),
                    invalidatesTags: [
                        {type: 'Transaction', id: 'ALL'},
                        {type: 'WagesList', id: 'WagesList'},
                        {type: 'WagesWeekInfo', id: "WagesWeekInfo"},
                    ],
                }),

                updateTransaction: build.mutation<Transaction, { id: number, transactionData: Partial<Transaction> }>({
                    query: ({id, transactionData}) => ({
                        url: `/staff/transactions/${id}/`,
                        method: 'PATCH',
                        body: transactionData
                    }),
                    invalidatesTags: (result, error, {id}) => [
                        {type: 'Transaction', id: 'ALL'},
                        {type: 'WagesList', id: 'WagesList'},
                        {type: 'WagesWeekInfo', id: "WagesWeekInfo"},
                    ],
                }),

                deleteTransaction: build.mutation<{ success: boolean, id: number }, number>({
                    query: (id) => ({
                        url: `/staff/transactions/${id}/`,
                        method: 'DELETE',
                    }),
                    invalidatesTags: (result, error) => [
                        {type: 'Transaction', id: 'ALL'},
                        {type: 'WagesList', id: 'WagesList'},
                        {type: 'WagesWeekInfo', id: "WagesWeekInfo"},
                    ],
                }),

                getAssignmentCounts: build.query<{results: AssignmentsCounter[]}, GetAssignmentsCount>({
                    query: (props: GetWagesListProps) => ({
                        url: '/staff/get_assignment_counts/',
                        params: {
                            ...props,
                        }
                    }),
                }),
            }
        )
    })
;

export const GetWagesList = WagesApi.useGetWagesListQuery;
export const GetWagesWeekInfo = WagesApi.useGetWagesWeekInfoQuery;
export const GetTransactionList = WagesApi.useGetTransactionQuery;
export const UseCreateTransaction = WagesApi.useCreateTransactionMutation;
export const UseUpdateTransaction = WagesApi.useUpdateTransactionMutation;
export const UseDeleteTransaction = WagesApi.useDeleteTransactionMutation;
export const UseGetAssignmentCounts = WagesApi.useGetAssignmentCountsQuery;