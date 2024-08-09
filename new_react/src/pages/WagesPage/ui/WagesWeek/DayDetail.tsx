import React from "react";

import {AppSkeleton} from "@shared/ui";
import {Transaction} from "@entities/Transaction";

import {GetTransactionList} from "../../model/api/api";

interface DayDetailProps {
    startDate: string;
    endDate: string;
    employeeId: number;
    onClick: (transaction: Transaction) => void;
}


export const DayDetail = (props: DayDetailProps) => {
    const {
        startDate,
        endDate,
        employeeId,
        onClick,
    } = props;

    const {data, isLoading} = GetTransactionList({
        employee: employeeId,
        start_date: startDate.slice(0, 10),
        end_date: endDate.slice(0, 10),
    });

    return (
        <>
            {data && data.map((transaction) => (
                <tr key={transaction.id}>
                    <td
                        colSpan={3}
                        onClick={() => onClick(transaction)}
                        style={{
                            cursor: 'pointer',
                            backgroundColor: transaction.inspect_date ? '#cee0c7' : '#ffc5c5',
                        }}>
                        <b>
                            {`${transaction.transaction_type === "accrual"
                                ? "➕"
                                : "➖"
                            }
                        ${Number(transaction.amount).toLocaleString('ru-RU')}`}
                        </b>
                        {` - ${transaction.description}`}
                    </td>
                </tr>
            ))}

            {isLoading &&
                <tr>
                    <td colSpan={3}>
                        <AppSkeleton style={{width: '100%', height: '30px'}} className={'mb-1'}/>
                        <AppSkeleton style={{width: '100%', height: '30px'}} className={'mb-1'}/>
                        <AppSkeleton style={{width: '100%', height: '30px'}} className={'mb-1'}/>
                    </td>
                </tr>

            }

            {data && data.length === 0 &&
                <tr>
                    <td colSpan={3}>
                        <h6>Нет транзакций за {startDate.slice(0, 10)} - {endDate.slice(0, 10)}</h6>
                    </td>
                </tr>
            }
        </>
    )
}