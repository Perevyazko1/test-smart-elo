import React, {useCallback} from "react";

import {useEmployeeName, usePermission} from "@shared/hooks";
import {EqAssignment} from "@widgets/EqCardList";

import {EqNumberListTipe} from "../../model/lib/createEqNumberLists";
import {EqNumberBtn} from "./EqNumberBtn";
import {useLazyPrintLabels} from "@widgets/EqCard/model/api/updateTiming";
import {APP_PERM} from "@shared/consts";


interface EqNumbersProps {
    targetUserId: number | undefined;
    assignmentsLists: EqNumberListTipe,
    setNumber: (item: EqAssignment) => void;
}

export const EqNumbers = (props: EqNumbersProps) => {
    const {assignmentsLists, targetUserId, setNumber} = props;
    const {getNameById} = useEmployeeName();

    const isBoss = usePermission(APP_PERM.ELO_BOSS_VIEW_MODE)

    const getCoExecutorAmount = useCallback((item: EqAssignment) => {
        return item.co_executors?.find(co_executor => co_executor.co_executor === targetUserId)?.wages_amount;
    }, [targetUserId]);

    const [
        requestPrintLabels,
        {isLoading: printLoading}
    ] = useLazyPrintLabels();

    const targetAssignments = [
        ...assignmentsLists.primary.map(item => item.id),
        ...assignmentsLists.selectedLocked.map(item => item.id),
    ]

    const printLabels = () => {
        if (window.confirm(`Распечатать бегуны ${targetAssignments.length} шт?`)) {
            requestPrintLabels({
                assignment_ids: targetAssignments
            })
        }
    }

    const printNumber = (assignment_id: number) => {
        if (window.confirm(`Распечатать бегун 1 шт?`)) {
            requestPrintLabels({
                assignment_ids: [assignment_id]
            })
        }
    }

    return (
        <>
            {isBoss && (
                <button
                    className={"appBtn p-1 rounded h-100 fw-bold position-relative"}
                    style={{minWidth: '35px', fontSize: 12}}
                    disabled={printLoading || targetAssignments.length === 0}
                    onClick={printLabels}
                >
                    🖨️
                </button>
            )}

            {assignmentsLists.primary.map((item) => (
                <EqNumberBtn
                    key={item.id}
                    item={item}
                    userInitials={getNameById(item.executor, 'initials')}
                    onClick={() => setNumber(item)}
                    colorCls={'blueBtn'}
                    amount={item.amount}
                    onDoubleClick={() => printNumber(item.id)}
                />
            ))}

            {assignmentsLists.coExecuted.map((item) => (
                <EqNumberBtn
                    key={item.id}
                    item={item}
                    userInitials={getNameById(item.executor, 'initials')}
                    amount={getCoExecutorAmount(item)}
                    colorCls={item.inspector ? 'greenBtn' : 'blueBtn'}
                    diagonalBg
                    onDoubleClick={() => printNumber(item.id)}
                />
            ))}

            {assignmentsLists.selectedLocked.map((item) => (
                <EqNumberBtn
                    key={item.id}
                    item={item}
                    userInitials={getNameById(item.executor, 'initials')}
                    amount={item.amount}
                    onClick={() => setNumber(item)}
                    colorCls={'blackBtn'}
                    onDoubleClick={() => printNumber(item.id)}
                />
            ))}

            {assignmentsLists.secondary.map((item) => (
                <EqNumberBtn
                    key={item.id}
                    item={item}
                    userInitials={getNameById(item.executor, 'initials')}
                    amount={item.amount}
                    onClick={() => setNumber(item)}
                    colorCls={'greyBtn'}
                    onDoubleClick={() => printNumber(item.id)}
                />
            ))}

            {assignmentsLists.lockedNums.map((item) => (
                <EqNumberBtn
                    key={item.id}
                    item={item}
                    userInitials={getNameById(item.executor, 'initials')}
                    amount={item.amount}
                    onClick={() => setNumber(item)}
                    colorCls={''}
                    onDoubleClick={() => printNumber(item.id)}
                />
            ))}

            {assignmentsLists.confirmed.map((item) => (
                <EqNumberBtn
                    key={item.id}
                    item={item}
                    userInitials={getNameById(item.executor, 'initials')}
                    amount={item.amount}
                    colorCls={item.assembled ? 'greenBtn' : 'blackBtn'}
                    diagonalBg={!item.assembled}
                    onDoubleClick={() => printNumber(item.id)}
                />
            ))}
        </>
    );
};
