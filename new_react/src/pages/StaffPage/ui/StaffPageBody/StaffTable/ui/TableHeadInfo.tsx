import {useFormattedValue, usePermission, useQueryParams} from "@shared/hooks";

import {DateRange} from "@pages/TaskPage";
import {APP_PERM} from "@shared/consts";

import {RangeData} from "../../../../model/types";
import {ConfirmTransactions} from "../../../../model/api/api";
import {AppTooltip} from "@shared/ui";
import {useMemo} from "react";
import {getHumansDatetime} from "@shared/lib";


interface TableHeadInfoProps {
    ids: number[];
    headInfo: RangeData;
    onClick: (range: DateRange | undefined) => void;
}

export const TableHeadInfo = (props: TableHeadInfoProps) => {
    const {headInfo, onClick, ids} = props;
    const {formatValue} = useFormattedValue();

    const {queryParameters} = useQueryParams();

    const [confirmTransactions, {isLoading}] = ConfirmTransactions();

    const confirmPerm = usePermission(APP_PERM.TARIFFICATION_CONFIRM);

    const confirmTransactionsClb = (target_list: 'wages' | 'debit') => {
        const askString = `Будут завизированы транзакции ${target_list === 'wages' ? 'начислений' : 'выдачи'} за период с ${headInfo.date_range.start_date} по ${headInfo.date_range.end_date}. Продолжить?`
        if (window.confirm(askString)) {
            confirmTransactions({
                ids: ids,
                start_date: headInfo.date_range.start_date,
                end_date: headInfo.date_range.end_date,
                by_target_date: !queryParameters.by_target_date,
                wages_only: !!queryParameters.wages_only,
                target_list: target_list
            })
        }
    };

    const dateRangeInfo = useMemo(() => {
        return `${getHumansDatetime(
            headInfo.date_range.start_date, 'DD-MM'
        )}-${getHumansDatetime(
                headInfo.date_range.end_date, 'DD-MM')}`
    }, [headInfo.date_range.end_date, headInfo.date_range.start_date])

    return (
        <th>
            <AppTooltip title={'Выбрать'}>
                <div
                    className={'d-flex align-items-center'}
                    onClick={() => onClick(headInfo.date_range)}
                    style={{cursor: "pointer"}}
                >
                    <span>{headInfo.range_type} {headInfo.range_value}</span>
                    <span className={'fs-7 ps-1'}>{headInfo.no_confirmed ? "❌" : "✔️"}</span>
                    <span className={'fs-7 ps-1'}>{dateRangeInfo}</span>
                </div>
            </AppTooltip>

            <hr className={'m-1 p-0'}/>

            <div className={'px-1'}>
                <div className={'d-flex fs-7 p-0 m-0 gap-1 align-items-center justify-content-between'}>
                    <div className={'d-flex align-items-center gap-1'}>
                        <span>{formatValue(headInfo.accrual).strValue}</span>
                        {headInfo.pre_accrual !== 0 && (
                            <span style={{fontSize: 10}} className={'text-danger pb-1'}>
                                ({formatValue(headInfo.pre_accrual, true).strValue})
                            </span>
                        )}
                    </div>
                    {confirmPerm && headInfo.pre_accrual !== 0 && (
                        <button
                            onClick={() => confirmTransactionsClb('wages')}
                            type={'button'}
                            className={'appBtn'}
                            disabled={isLoading}
                        >
                            ✅
                        </button>
                    )}
                </div>
                <div className={'d-flex fs-7 p-0 m-0 gap-1 align-items-center justify-content-between'}>
                    <div className={'d-flex align-items-center gap-1'}>
                        <span>{formatValue(-headInfo.debit).strValue}</span>
                        {headInfo.pre_debit !== 0 && (
                            <span style={{fontSize: 10}} className={'text-danger pb-1'}>
                                ({formatValue(headInfo.pre_debit, true).strValue})
                            </span>
                        )}
                    </div>
                    {confirmPerm && headInfo.pre_debit !== 0 && (
                        <button
                            onClick={() => confirmTransactionsClb('debit')}
                            type={'button'}
                            className={'appBtn'}
                            disabled={isLoading}
                        >
                            ✅
                        </button>
                    )}
                </div>
            </div>
        </th>
    );
};
