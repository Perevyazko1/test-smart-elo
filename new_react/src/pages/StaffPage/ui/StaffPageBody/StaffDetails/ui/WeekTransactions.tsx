import {useMemo} from "react";
import {format, parseISO} from 'date-fns';
import {ru} from 'date-fns/locale';

import {Employee} from "@entities/Employee";
import {Transaction} from "@entities/Transaction";
import {useQueryParams} from "@shared/hooks";
import {AppSkeleton} from "@shared/ui";
import {getHumansDatetime} from "@shared/lib";

import {StaffInfo} from "../../../../model/types";
import {GetTransactions} from "../../../../model/api/api";

import {TransactionDay} from "./TransactionDay";

interface WeekTransactionsProps {
    selectedEmployee: Employee;
    isLoading: boolean;
    userInfo: StaffInfo | undefined;
    has_inspector?: boolean;
    start_date?: string;
    end_date?: string;
}

export const WeekTransactions = (props: WeekTransactionsProps) => {
    const {userInfo, isLoading, selectedEmployee, start_date, end_date, has_inspector} = props;

    const {queryParameters, setQueryParam} = useQueryParams();

    const {data, isLoading: transactionsIsLoading, isFetching: transactionsIsFetching} = GetTransactions({
        employee: selectedEmployee.id,
        start_date: start_date || userInfo?.user_total_info.I.date_range.start_date,
        end_date: end_date || userInfo?.user_total_info.I.date_range.end_date,
        ...(has_inspector && {
            has_inspector: has_inspector,
        })
    }, {skip: (!userInfo && (!start_date || !end_date))});

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return 'Unknown date';

        const date = parseISO(dateString);
        return format(date, "EEEE dd.MM", {locale: ru}); // "EEEE" — день недели, "dd.MM" — формат даты
    };

    const groupTransactionsByDate = useMemo(() => {
        return data?.reduce((acc, transaction) => {
            const formattedDate = formatDate(
                queryParameters.by_target_date
                    ? transaction.add_date
                    : transaction.target_date
            );
            if (!acc[formattedDate]) {
                acc[formattedDate] = [];
            }
            acc[formattedDate].push(transaction);
            return acc;
        }, {} as Record<string, Transaction[]>) || {};
    }, [data, queryParameters.by_target_date]);

    const setNewWeek = (next: boolean) => {
        if (next) {
            setQueryParam('start_date', userInfo?.user_total_info.I.next_range.start_date || "");
            setQueryParam('end_date', userInfo?.user_total_info.I.next_range.end_date || "");
        } else {
            setQueryParam('start_date', userInfo?.user_total_info.I.previous_range.start_date || "");
            setQueryParam('end_date', userInfo?.user_total_info.I.previous_range.end_date || "");
        }
    };

    const rangeData = useMemo(() => {
        return userInfo?.user_total_info.I;
    }, [userInfo?.user_total_info.I]);


    return (
        <>
            {!start_date && !end_date && (

                <div className={'d-flex align-items-center p-2'}>

                    <button
                        onClick={() => setNewWeek(true)}
                        type={'button'}
                        className={'appBtn p-1 blueBtn'}>
                        След.
                    </button>

                    <div className={'d-flex justify-content-center flex-fill fs-7 fw-bold'}>
                        {rangeData ? (
                            <>
                                {`${rangeData.range_type} ${rangeData.range_value} c 
                            ${getHumansDatetime(rangeData.date_range.start_date, 'DD-MM')} по 
                            ${getHumansDatetime(rangeData.date_range.end_date, 'DD-MM')}`}
                            </>
                        ) : (
                            <AppSkeleton/>
                        )}
                    </div>

                    <button
                        onClick={() => setNewWeek(false)}
                        type={'button'}
                        className={'appBtn p-1 blueBtn'}
                    >
                        Пред.
                    </button>
                </div>
            )}

            <hr className={'p-0 m-0'}/>

            <div
                className={'position-relative m-1 pb-2'}
                style={{
                    overflowY: 'auto',
                    maxHeight: '88%',
                }}
            >
                {(isLoading || transactionsIsLoading || transactionsIsFetching) ? (
                    <div className={'d-flex flex-column gap-1 p-1'}>
                        <AppSkeleton style={{height: 16}} showSpinner={false}/>
                        <AppSkeleton style={{height: 14}} showSpinner={false}/>
                        <AppSkeleton style={{height: 12}} showSpinner={false}/>
                    </div>
                ) : (
                    <>
                        {Object.keys(groupTransactionsByDate).length > 0 ? (
                            Object.entries(groupTransactionsByDate).map(([formattedDate, transactions]) => (
                                <TransactionDay
                                    key={formattedDate}
                                    day={formattedDate}
                                    transactions={transactions}
                                    selectedEmployee={selectedEmployee}
                                />
                            ))
                        ) : (
                            <div className={'fs-7 fw-bold'}>
                                Нет начислений / списаний
                            </div>
                        )

                        }
                    </>
                )}
            </div>
        </>
    );
};
