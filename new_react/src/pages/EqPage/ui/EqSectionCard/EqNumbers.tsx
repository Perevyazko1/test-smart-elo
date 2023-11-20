import React, {useEffect, useState} from "react";
import {useAppQuery} from "@shared/hooks";
import {createEqNumberLists} from "@pages/EqPage/model/lib/createEqNumberLists";
import {Assignment} from "@entities/Assignment";

import {setTargetNumber} from "../../model/lib/setTargetNumber";

interface EqNumbersProps {
    assignments: Assignment[],
}

export const EqNumbers = (props: EqNumbersProps) => {
    const {assignments} = props;

    const {queryParameters, setQueryParam} = useAppQuery();

    const [
        assignmentsLists,
        setAssignmentsLists
    ] = useState(createEqNumberLists(assignments, Number(queryParameters.series_size) || 1));

    const setNumber = (assignment_number: number) => {
        setAssignmentsLists(setTargetNumber(
            assignmentsLists.primary,
            assignmentsLists.secondary,
            assignmentsLists.confirmed,
            assignment_number)
        )
        setQueryParam('series_size', '')
    }

    useEffect(() => {
        setAssignmentsLists(createEqNumberLists(assignments, Number(queryParameters.series_size) || 1))
    }, [assignments, queryParameters.series_size])

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
