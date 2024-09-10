import React, {HTMLAttributes, memo, useMemo} from "react";
import {useCardHeight} from "@pages/EqPage";
import {EqAssignment} from "@widgets/EqCardList/model/types";


interface EqNumberBtnProps extends HTMLAttributes<HTMLButtonElement> {
    item: EqAssignment;
    userInitials: string;
    colorCls: 'blueBtn' | 'redBtn' | 'blackBtn' | 'greyBtn' | 'greenBtn' | '';
}

export const EqNumberBtn = memo((props: EqNumberBtnProps) => {
    const {userInitials, item, colorCls, ...buttonProps} = props;
    const cardHeight = useCardHeight();

    const fontSize = useMemo(() => {
        return cardHeight / 6.5;
    }, [cardHeight]);

    return (
        <button
            className={`appBtn ${colorCls} p-1 rounded h-100 fw-bold position-relative`}
            style={{minWidth: '35px', fontSize: fontSize}}
            {...buttonProps}
        >
            {item.number}
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

            <div
                className={'position-absolute'}
                style={{
                    bottom: -4.8,
                    fontSize: cardHeight / 11,
                    left: '50%',
                    transform: "translate(-50%)",
                }}
            >
                {item.amount}
            </div>
        </button>
    );
});
