import {HTMLAttributes, useMemo} from "react";

import cls from "./EqCard.module.scss";

import {useCardHeight} from "@pages/EqPage";
import {EqOrderProduct} from "@widgets/EqCardList";

interface EqCardBodyProps extends HTMLAttributes<HTMLDivElement> {
    card: EqOrderProduct;
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
