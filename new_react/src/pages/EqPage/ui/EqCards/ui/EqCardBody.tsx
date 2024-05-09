import {HTMLAttributes, useMemo} from "react";

import cls from "./EqCard.module.scss";

import {EqCardType} from "../../../model/types/eqCardType";
import {useCardHeight} from "../../../model/lib/useCardHeight";

interface EqCardBodyProps extends HTMLAttributes<HTMLDivElement> {
    card: EqCardType;
}

export const EqCardBody = (props: EqCardBodyProps) => {
    const {card, children, ...otherProps} = props;

    const cardHeight = useCardHeight();

    const getScaled = useMemo(() => {
        return card.assignments.length !== 0 ? 'unscaled' : "scaled"
    }, [card.assignments.length])

    return (
        <div className={'mt-1 pb-05'} {...otherProps} style={{height: `${cardHeight}px`}}>
            <div className={cls.overflowWrapper + ` bg-black rounded rounded-2 ${getScaled}`}>
                {children}
            </div>
        </div>
    );
};
