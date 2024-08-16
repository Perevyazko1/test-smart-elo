import React, {memo, useMemo} from "react";
import {useCardHeight} from "@pages/EqPage";


interface EqNumberBtnProps {
    number: number;
    setNumber?: (number: number) => void;
    getUserInitials?: (assignmentNumber: number) => string;
    getTariff?: (assignmentNumber: number) => number | undefined;
    colorCls: 'blueBtn' | 'redBtn' | 'blackBtn' | 'greyBtn' | 'greenBtn' | '';
}

export const EqNumberBtn = memo((props: EqNumberBtnProps) => {
    const {setNumber, getUserInitials, number, getTariff, colorCls} = props;
    const cardHeight = useCardHeight();

    const userInitials = useMemo(() => {
        return getUserInitials ? getUserInitials(number) : '';
    }, [getUserInitials, number]);

    const fontSize = useMemo(() => {
        return cardHeight / 6.5;
    }, [cardHeight]);

    return (
        <button
            className={`appBtn ${colorCls} p-1 rounded h-100 fw-bold position-relative`}
            style={{minWidth: '35px', fontSize: fontSize}}
            key={number}
            onClick={setNumber ? () => setNumber(number) : undefined}
        >
            {number}
            <div
                className={'position-absolute'}
                style={{
                    top: -4.2,
                    fontSize: cardHeight / 12,
                    left: '50%',
                    transform: "translate(-50%)",
                }}
            >
                {userInitials}
            </div>

            {getTariff &&
                <div
                    className={'position-absolute'}
                    style={{
                        bottom: -4.8,
                        fontSize: cardHeight / 11,
                        left: '50%',
                        transform: "translate(-50%)",
                    }}
                >
                    {getTariff(number)}
                </div>
            }
        </button>
    );
});
