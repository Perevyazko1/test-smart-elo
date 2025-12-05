import React, {HTMLAttributes, memo, useMemo} from "react";
import {useCardHeight} from "@pages/EqPage";
import {EqAssignment} from "@widgets/EqCardList/model/types";
import {useCurrentUser, usePermission} from "@shared/hooks";
import {APP_PERM} from "@shared/consts";


interface EqNumberBtnProps extends HTMLAttributes<HTMLButtonElement> {
    item: EqAssignment;
    userInitials: string;
    urgency: EqAssignment["urgency"];
    amount?: number;
    colorCls: 'blueBtn' | 'redBtn' | 'blackBtn' | 'greyBtn' | 'greenBtn' | '';
    diagonalBg?: boolean;
}

export const EqNumberBtn = memo((props: EqNumberBtnProps) => {
    const {userInitials, item, colorCls, amount, urgency, diagonalBg = false, ...buttonProps} = props;
    const cardHeight = useCardHeight();

    const bossBerm = usePermission(APP_PERM.ELO_BOSS_VIEW_MODE);
    const {currentUser} = useCurrentUser();

    const fontSize = useMemo(() => {
        return cardHeight / 6.5;
    }, [cardHeight]);

    const buttonClasses = useMemo(() => {
        let classes = `appBtn ${colorCls} p-1 rounded h-100 fw-bold position-relative `;
        if (diagonalBg) {
            classes += ' diagonalBg';
        }
        if (urgency === 1) {
            classes += ' urgency-1';
        } else if (urgency === 2) {
            classes += ' urgency-2';
        } else if (urgency === 3) {
            classes += ' urgency-3';
        }
        return classes;
    }, [colorCls, diagonalBg]);

    return (
        <button
            className={buttonClasses}
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

            {(currentUser.piecework_wages || bossBerm) ?
                <div
                    className={'position-absolute'}
                    style={{
                        bottom: -4.8,
                        fontSize: cardHeight / 11,
                        left: '50%',
                        transform: "translate(-50%)",
                    }}
                >
                    {amount}
                </div>
                : null
            }

            <div
                className={
                'position-absolute top-0 end-0 rounded-circle ' +
                    (item.print_count > 0 ?
                        'bg-success' :
                        'bg-warning')
            }
                style={{
                    height: 5,
                    width: 5,
                }}
            >

            </div>
        </button>
    );
});
