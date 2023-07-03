import React, {memo, ReactNode} from 'react';
import {Button} from "react-bootstrap";

import {classNames} from "shared/lib/classNames/classNames";

import cls from './EqCardNumbers.module.scss';

interface EqCardNumbersProps {
    assignmentsLists: { primary: number[], secondary: number[], confirmed: number[] },
    callback: (number: number) => void;
}


export const EqCardNumbers = memo((props: EqCardNumbersProps) => {
    const {
        assignmentsLists,
        callback,
    } = props

    return (
        <div className={cls.numbers}>
            {assignmentsLists.primary?.map((number) => (
                <Button
                    key={number}
                    className={classNames(cls.number, {}, ["fs-5 fw-bold"])}
                    variant={'primary'}
                >
                    {number}
                </Button>
            ))}
            {assignmentsLists.secondary?.map((number) => (
                <Button
                    key={number}
                    className={classNames(cls.number, {}, ["fs-5 fw-bold"])}
                    variant={'secondary'}
                    onClick={() => callback(number)}
                >
                    {number}
                </Button>
            ))}
            {assignmentsLists.confirmed?.map((number) => (
                <Button
                    key={number}
                    className={classNames(cls.number, {}, ["fs-5 fw-bold"])}
                    variant={'success'}
                >
                    {number}
                </Button>
            ))}
        </div>
    );
});