import React from "react";

import {EqNumberListTipe} from "../../model/lib/createEqNumberLists";
import {EqNumberBtn} from "@widgets/EqCard/ui/ui/EqNumberBtn";

interface EqNumbersProps {
    getUserInitials?: (assignmentNumber: number) => string;
    getTariff?: (assignmentNumber: number) => number | undefined;
    assignmentsLists: EqNumberListTipe,
    setNumber: (number: number) => void;
}

export const EqNumbers = (props: EqNumbersProps) => {
    const {assignmentsLists, setNumber, getUserInitials, getTariff} = props;


    return (
        <>
            {assignmentsLists.primary.map((number) => (
                <EqNumberBtn
                    getTariff={getTariff}
                    getUserInitials={getUserInitials}
                    number={number}
                    key={number}
                    setNumber={setNumber}
                    colorCls={'blueBtn'}
                />
            ))}

            {assignmentsLists.selectedLocked.map((number) => (
                <EqNumberBtn
                    getTariff={getTariff}
                    getUserInitials={getUserInitials}
                    number={number}
                    key={number}
                    setNumber={setNumber}
                    colorCls={'blackBtn'}
                />
            ))}

            {assignmentsLists.secondary.map((number) => (
                <EqNumberBtn
                    getTariff={getTariff}
                    getUserInitials={getUserInitials}
                    number={number}
                    key={number}
                    setNumber={setNumber}
                    colorCls={'greyBtn'}
                />
            ))}

            {assignmentsLists.lockedNums.map((number) => (
                <EqNumberBtn
                    getTariff={getTariff}
                    getUserInitials={getUserInitials}
                    number={number}
                    key={number}
                    setNumber={setNumber}
                    colorCls={''}
                />
            ))}

            {assignmentsLists.confirmed.map((number) => (
                <EqNumberBtn
                    getTariff={getTariff}
                    getUserInitials={getUserInitials}
                    number={number}
                    key={number}
                    colorCls={'greenBtn'}
                />
            ))}
        </>
    );
};
