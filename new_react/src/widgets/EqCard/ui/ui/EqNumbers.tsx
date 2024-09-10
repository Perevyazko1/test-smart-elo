import React from "react";

import {useEmployeeName} from "@shared/hooks";
import {EqAssignment} from "@widgets/EqCardList";

import {EqNumberListTipe} from "../../model/lib/createEqNumberLists";
import {EqNumberBtn} from "./EqNumberBtn";


interface EqNumbersProps {
    assignmentsLists: EqNumberListTipe,
    setNumber: (item: EqAssignment) => void;
}

export const EqNumbers = (props: EqNumbersProps) => {
    const {assignmentsLists, setNumber} = props;
    const {getNameById} = useEmployeeName();

    return (
        <>
            {assignmentsLists.primary.map((item) => (
                <EqNumberBtn
                    key={item.id}
                    item={item}
                    userInitials={getNameById(item.executor, 'initials')}
                    onClick={() => setNumber(item)}
                    colorCls={'blueBtn'}
                />
            ))}

            {assignmentsLists.selectedLocked.map((item) => (
                <EqNumberBtn
                    key={item.id}
                    item={item}
                    userInitials={getNameById(item.executor, 'initials')}
                    onClick={() => setNumber(item)}
                    colorCls={'blackBtn'}
                />
            ))}

            {assignmentsLists.secondary.map((item) => (
                <EqNumberBtn
                    key={item.id}
                    item={item}
                    userInitials={getNameById(item.executor, 'initials')}
                    onClick={() => setNumber(item)}
                    colorCls={'greyBtn'}
                />
            ))}

            {assignmentsLists.lockedNums.map((item) => (
                <EqNumberBtn
                    key={item.id}
                    item={item}
                    userInitials={getNameById(item.executor, 'initials')}
                    onClick={() => setNumber(item)}
                    colorCls={''}
                />
            ))}

            {assignmentsLists.confirmed.map((item) => (
                <EqNumberBtn
                    key={item.id}
                    item={item}
                    userInitials={getNameById(item.executor, 'initials')}
                    colorCls={'greenBtn'}
                />
            ))}
        </>
    );
};
