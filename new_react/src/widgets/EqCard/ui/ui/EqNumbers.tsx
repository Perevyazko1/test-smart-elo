import React, {useCallback} from "react";

import {useEmployeeName} from "@shared/hooks";
import {EqAssignment} from "@widgets/EqCardList";

import {EqNumberListTipe} from "../../model/lib/createEqNumberLists";
import {EqNumberBtn} from "./EqNumberBtn";


interface EqNumbersProps {
    targetUserId: number | undefined;
    assignmentsLists: EqNumberListTipe,
    setNumber: (item: EqAssignment) => void;
}

export const EqNumbers = (props: EqNumbersProps) => {
    const {assignmentsLists, targetUserId, setNumber} = props;
    const {getNameById} = useEmployeeName();

    const getCoExecutorAmount = useCallback((item: EqAssignment) => {
        return item.co_executors?.find(co_executor => co_executor.co_executor === targetUserId)?.wages_amount;
    }, [targetUserId]);

    return (
        <>
            {assignmentsLists.primary.map((item) => (
                <EqNumberBtn
                    key={item.id}
                    item={item}
                    userInitials={getNameById(item.executor, 'initials')}
                    onClick={() => setNumber(item)}
                    colorCls={'blueBtn'}
                    amount={item.amount}
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
                />
            ))}
        </>
    );
};
