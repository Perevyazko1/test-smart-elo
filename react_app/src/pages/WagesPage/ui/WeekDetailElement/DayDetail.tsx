import React from "react";
import {Skeleton} from "shared/ui/Skeleton/Skeleton";
import {Transaction} from "entities/Transaction";

import {GetTransactionList} from "../../model/api/api";

interface DayDetailProps {
    daySrt: string;
    employeeId: number;
    onClick: (transaction: Transaction) => void;
}


export const DayDetail = (props: DayDetailProps) => {
    const {
        daySrt,
        employeeId,
        onClick,
    } = props;

    const {data, isLoading} = GetTransactionList({
        employee: employeeId,
        add_date: daySrt.slice(0, 10),
    })

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
                        <Skeleton width={'100%'} height={'40px'} rounded={false} pagination_size={3} scaled={true}/>
                    </td>
                </tr>

            }

            {data && data.length === 0 &&
                <tr>
                    <td colSpan={3}>
                        <h5>Нет транзакций за {daySrt.slice(0, 10)}</h5>
                    </td>
                </tr>
            }
        </>
    )
}