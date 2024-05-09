import React from "react";

interface EqNumbersProps {
    assignmentsLists: {primary: number[], secondary: number[], confirmed: number[]},
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
