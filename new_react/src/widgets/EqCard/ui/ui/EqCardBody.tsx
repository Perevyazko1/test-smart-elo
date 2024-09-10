import {HTMLAttributes, useMemo} from "react";

import cls from "./EqCard.module.scss";

import {useCardHeight} from "@pages/EqPage";
import {EqOrderProduct} from "@widgets/EqCardList";

interface EqCardBodyProps extends HTMLAttributes<HTMLDivElement> {
    card: EqOrderProduct;
}

export const EqCardBody = (props: EqCardBodyProps) => {
    const {card, children, style, ...otherProps} = props;

    const cardHeight = useCardHeight();

    const getScaled = useMemo(() => {
        return card.assignments.length !== 0 ? 'unscaled' : "scaled"
    }, [card.assignments.length])

    return (
        <div  {...otherProps} style={{height: `${cardHeight}px`, maxWidth: '1200px', margin: '0.15rem 0.25rem'}}>
            <div className={cls.overflowWrapper + ` bg-black rounded rounded-2 ${getScaled}`}>
                {children}
            </div>
        </div>
    );
};
