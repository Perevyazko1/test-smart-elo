import React, {HTMLAttributes, memo, useMemo} from "react";
import {useCardHeight} from "@pages/EqPage";
import {EqAssignment} from "@widgets/EqCardList/model/types";
import {useCurrentUser, usePermission} from "@shared/hooks";
import {APP_PERM} from "@shared/consts";


interface EqNumberBtnProps extends HTMLAttributes<HTMLButtonElement> {
    item: EqAssignment;
    userInitials: string;
    amount?: number;
    colorCls: 'blueBtn' | 'redBtn' | 'blackBtn' | 'greyBtn' | 'greenBtn' | '';
    diagonalBg?: boolean;
}

export const EqNumberBtn = memo((props: EqNumberBtnProps) => {
    const {userInitials, item, colorCls, amount, diagonalBg = false, ...buttonProps} = props;
    const cardHeight = useCardHeight();

    const bossBerm = usePermission(APP_PERM.ELO_BOSS_VIEW_MODE);
    const {currentUser} = useCurrentUser();

    const fontSize = useMemo(() => {
        return cardHeight / 6.5;
    }, [cardHeight]);

    const buttonClasses = useMemo(() => {
        let classes = `appBtn ${colorCls} p-1 rounded h-100 fw-bold position-relative`;
        if (diagonalBg) {
            classes += ' diagonalBg';
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
        </button>
    );
});


// Альтернативный макет с датой/временем в нарядах
//
// <button
//     className={buttonClasses}
//     style={{minWidth: '55px', fontSize: fontSize}}
//     {...buttonProps}
// >
//     <div className={'d-flex w-100 justify-content-evenly'}>
//         <div className={'position-relative'}>
//             {item.number}
//             <div
//                 className={'position-absolute'}
//                 style={{
//                     top: -8.5,
//                     fontSize: cardHeight / 12,
//                     left: '50%',
//                     transform: "translate(-50%)",
//                 }}
//             >
//                 {userInitials}
//             </div>
//
//             {amount ?
//                 <div
//                     className={'position-absolute'}
//                     style={{
//                         bottom: -8.5,
//                         fontSize: cardHeight / 11,
//                         left: '50%',
//                         transform: "translate(-50%)",
//                     }}
//                 >
//                     {amount}
//                 </div>
//                 : null
//             }
//         </div>
//
//         <div style={{width: 2, borderLeft: '2px solid black'}}>
//
//         </div>
//         <div style={{fontSize: 10, lineHeight: 1}}>
//             04.10
//             <br/>
//             10:32
//         </div>
//     </div>
// </button>

