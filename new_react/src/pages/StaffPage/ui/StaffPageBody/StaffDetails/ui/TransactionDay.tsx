import {useMemo} from "react";

import {Transaction} from "@entities/Transaction";
import {Employee} from "@entities/Employee";
import {useAppModal, useFormattedValue, useQueryParams} from "@shared/hooks";
import {getHumansDatetime} from "@shared/lib";

import {StaffTransactionForm} from "../../../StaffTransactionForm/StaffTransactionForm";


interface TransactionDayProps {
    selectedEmployee: Employee;
    day: string;
    transactions: Transaction[];
}


export const TransactionDay = (props: TransactionDayProps) => {
    const {transactions, day, selectedEmployee} = props;

    const {queryParameters} = useQueryParams();
    const {formatValue} = useFormattedValue();
    const {handleOpen, handleClose} = useAppModal();

    const totalAmount = useMemo(() => {
        return transactions.reduce((sum, transaction) => {
            return sum + Number(transaction.amount);
        }, 0)
    }, [transactions]);

    const totalAccrual = useMemo(() => {
        return transactions.reduce((sum, transaction) => {
            if (transaction.transaction_type === 'accrual') {
                return sum + Number(transaction.amount);
            }
            return sum;
        }, 0)
    }, [transactions]);

    const totalDebit = useMemo(() => {
        return totalAmount - totalAccrual;
    }, [totalAccrual, totalAmount]);

    const showTransactionClb = (transaction: Transaction) => {
        handleOpen(
            <StaffTransactionForm
                title={`Создание начисления сотруднику ${selectedEmployee.first_name} ${selectedEmployee.last_name}`}
                employee={selectedEmployee}
                transaction={transaction}
                deleteClb={handleClose}
            />
        )
    }

    return (
        <>
            <div
                className={'position-sticky bg-warning-subtle fw-bold ps-2 text-capitalize border border-2 border-black'}
                style={{top: 0, zIndex: 100}}
            >
                {day} <br/>
                {totalAccrual !== 0 && formatValue(totalAccrual).strValue} {totalDebit !== 0 && (formatValue(-totalDebit).strValue)}
            </div>

            {transactions.map(transaction => (
                    <div key={transaction.id}
                         style={{
                             cursor: 'pointer',
                             backgroundColor: transaction.inspect_date ? '' : '#ffc5c5',
                         }}
                         onClick={() => showTransactionClb(transaction)}
                    >
                        <div className={'d-flex gap-1 p-1 fs-7'}>
                            <span>
                                {
                                    getHumansDatetime(
                                        queryParameters.by_target_date
                                            ? (transaction.add_date || "")
                                            : (transaction.target_date || "")
                                        , 'full')
                                }
                            </span>
                            <span>
                                {formatValue(
                                    transaction.transaction_type === 'accrual' ?
                                        transaction.amount : -transaction.amount
                                ).strValue}
                            </span>
                            <span>
                                {transaction.description}
                            </span>
                        </div>

                        <hr className={'m-0 p-0'}/>
                    </div>
                )
            )}
        </>
    );
};
