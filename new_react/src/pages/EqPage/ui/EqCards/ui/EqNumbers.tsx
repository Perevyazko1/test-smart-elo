import React from "react";
import {EqNumberListTipe} from "@pages/EqPage/model/lib/createEqNumberLists";

interface EqNumbersProps {
    assignmentsLists: EqNumberListTipe,
    setNumber: (number: number) => void;
}

export const EqNumbers = (props: EqNumbersProps) => {
    const {assignmentsLists, setNumber} = props;


    return (
        <>
            {assignmentsLists.primary.map((number) => (
                <button
                    className={'appBtn blueBtn p-1 rounded h-100 fw-bold'}
                    style={{minWidth: '35px'}}
                    key={number}
                    onClick={() => setNumber(number)}
                >
                    {number}
                </button>
            ))}

            {assignmentsLists.selectedLocked.map((number) => (
                <button
                    className={'appBtn blackBtn p-1 rounded h-100 fw-bold'}
                    style={{minWidth: '35px'}}
                    key={number}
                    onClick={() => setNumber(number)}
                >
                    {number}
                </button>
            ))}

            {assignmentsLists.secondary.map((number) => (
                <button
                    className={'appBtn greyBtn p-1 rounded h-100 fw-bold'}
                    style={{minWidth: '35px'}}
                    key={number}
                    onClick={() => setNumber(number)}
                >
                    {number}
                </button>
            ))}

            {assignmentsLists.lockedNums.map((number) => (
                <button
                    className={'appBtn p-1 rounded h-100 fw-bold'}
                    style={{minWidth: '35px'}}
                    key={number}
                    onClick={() => setNumber(number)}
                >
                    {number}
                </button>
            ))}

            {assignmentsLists.confirmed.map((number) => (
                <button
                    className={'appBtn greenBtn p-1 rounded h-100 fw-bold'}
                    style={{minWidth: '35px'}}
                    key={number}
                >
                    {number}
                </button>
            ))}
        </>
    );
};
