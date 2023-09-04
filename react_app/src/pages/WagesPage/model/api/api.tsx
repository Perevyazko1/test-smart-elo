import {rtkAPI} from "shared/api/rtkAPI";
import {WagesList, WagesWeekInfo} from "../types/types";
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

const WagesApi = rtkAPI.injectEndpoints({
        endpoints: (build) => ({
                getWagesList: build.query<WagesList, GetWagesListProps>({
                    query: (props: GetWagesListProps) => ({
                        url: '/staff/wages_list/',
                        params: {
                            ...props
                        }
                    }),
                }),
                getWagesWeekInfo: build.query<WagesWeekInfo, GetWagesWeekInfoProps>({
                    query: (props: GetWagesWeekInfoProps) => ({
                        url: '/staff/get_wages_week_info/',
                        params: {
                            ...props
                        }
                    }),
                }),
                getTransaction: build.query<Transaction[], GetTransactionProps>({
                    query: (props: GetTransactionProps) => ({
                        url: '/staff/transactions/',
                        params: {
                            ...props
                        }
                    }),
                }),
                createTransaction: build.mutation<Transaction, CreateTransactionProps>({
                    query: (props: CreateTransactionProps) => ({
                        url: '/staff/transactions/',
                        method: 'POST',
                        body: props.transactionData,
                    }),
                }),

                updateTransaction: build.mutation<Transaction, { id: number, transactionData: Partial<Transaction> }>({
                    query: ({id, transactionData}) => ({
                        url: `/staff/transactions/${id}/`,
                        method: 'PATCH',
                        body: transactionData
                    }),
                }),

                deleteTransaction: build.mutation<{ success: boolean, id: number }, number>({
                    query: (id) => ({
                        url: `/staff/transactions/${id}/`,
                        method: 'DELETE',
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