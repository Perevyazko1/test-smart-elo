import {Transaction} from "@entities/Transaction";
import {rtkAPI} from "@shared/api";

import {AssignmentsCounter, StaffInfo} from "../types";


interface GetStaffInfoProps {
    ids?: number[] | null;
    ordering: 'permanent_department';
    start_date: string | undefined;
    end_date: string | undefined;
    by_target_date?: string | undefined;
    wages_only?: boolean | undefined;
}

interface GetTransactionProps {
    employee?: number,
    has_inspector?: boolean,
    start_date?: string,
    end_date?: string,
    by_target_date?: string | undefined;
}


interface GetAssignmentsCount {
    employee__id: number,
    date_from: string,
    date_by: string,
    select_by_visa: boolean;
}

interface ConfirmTransactionsProps {
    start_date: string;
    end_date: string;
    by_target_date: boolean;
    ids: number[];
    target_list: 'wages' | 'debit';
    wages_only: boolean;
}

interface CounterResults {
    results: AssignmentsCounter[]
}


const WagesApi = rtkAPI.injectEndpoints({
    endpoints: (build) => ({
        getStaffInfo: build.query<StaffInfo[], GetStaffInfoProps>({
            query: (props: GetStaffInfoProps) => ({
                url: '/staff/info/staff_info/',
                params: {
                    ...props,
                }
            }),
            providesTags: (result, error, arg) =>
                result
                    ? [...result.map(({id}) => ({type: 'StaffInfo' as const, id})), 'StaffInfo']
                    : ['StaffInfo'],
        }),

        getAssignmentCounts: build.query<CounterResults, GetAssignmentsCount>({
            query: (props: GetAssignmentsCount) => ({
                url: '/staff/info/get_assignment_counts/',
                params: {
                    employee__id: props.employee__id,
                    date_from: props.date_from,
                    date_by: props.date_by,
                    select_by_visa: props.select_by_visa,
                },
            }),
        }),

        getTransactions: build.query<Transaction[], GetTransactionProps>({
            query: (props: GetTransactionProps) => ({
                url: '/staff/info/transactions/',
                params: {
                    employee: props.employee,
                    start_date: props.start_date,
                    end_date: props.end_date,
                    ordering: '-inspector',
                    ...(props.by_target_date && {
                        by_target_date: props.by_target_date,
                    }),
                    ...(props.has_inspector && {
                        has_inspector: props.has_inspector,
                    })
                }
            }),
            providesTags: (result, error, arg) =>
                result
                    ? [...result.map(({id}) => ({type: 'Transaction' as const, id})), 'Transaction']
                    : ['Transaction'],
        }),

        createTransaction: build.mutation<Transaction, { transactionData: Transaction }>({
            query: (props: { transactionData: Transaction }) => ({
                url: '/staff/info/transactions/',
                method: 'POST',
                body: props.transactionData,
            }),
            invalidatesTags: [
                {type: 'Transaction'},
                {type: 'StaffInfo'},
            ],
        }),

        updateTransaction: build.mutation<Transaction, { id: number, transactionData: Partial<Transaction> }>({
            query: ({id, transactionData}) => ({
                url: `/staff/info/transactions/${id}/`,
                method: 'PATCH',
                body: transactionData
            }),
            invalidatesTags: (result, error, {id}) => [
                {type: 'Transaction', id: id},
                {type: 'StaffInfo', id: id},
                {type: 'UserList', id: id},
            ],
        }),

        deleteTransaction: build.mutation<{ success: boolean, id: number }, number>({
            query: (id) => ({
                url: `/staff/info/transactions/${id}/`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [
                {type: 'Transaction', id: id},
                {type: 'StaffInfo'},
            ],
        }),

        confirmTransactions: build.mutation<any, ConfirmTransactionsProps>({
            query: (props: ConfirmTransactionsProps) => ({
                url: '/staff/info/confirm_transactions/',
                method: 'POST',
                body: props,
            }),
            invalidatesTags: [
                {type: 'Transaction'},
                {type: 'StaffInfo'},
                {type: 'UserList'},
            ],
        }),
    })
});

export const GetStaffInfo = WagesApi.useGetStaffInfoQuery;
export const GetAssignmentCounts = WagesApi.useGetAssignmentCountsQuery;
export const GetTransactions = WagesApi.useGetTransactionsQuery;

export const CreateTransaction = WagesApi.useCreateTransactionMutation;
export const UpdateTransaction = WagesApi.useUpdateTransactionMutation;
export const DeleteTransaction = WagesApi.useDeleteTransactionMutation;
export const ConfirmTransactions = WagesApi.useConfirmTransactionsMutation;
