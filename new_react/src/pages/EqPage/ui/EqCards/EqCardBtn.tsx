import React, {ButtonHTMLAttributes, memo} from "react";
import {ListTypes} from "@pages/EqPage/model/consts/listTypes";
import {Spinner} from "react-bootstrap";


interface EqCardBtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    cardType: ListTypes,
    first: boolean,
    urgency: number,
    locked?: boolean,
}

export const EqCardBtn = memo((props: EqCardBtnProps) => {
    const {cardType, urgency, first, locked, ...otherProps} = props;

    const getButtonIcon = () => {
        if (cardType === 'await') {
            return <i className="fas fa-angle-double-left fs-2"/>;
        } else if (locked) {
            return <i className="fas fa-lock fs-5"/>;
        } else if (cardType === 'in_work' && first) {
            return <i className="fas fa-check fs-3"/>;
        } else if (cardType === 'in_work' && !first) {
            return <i className="fas fa-angle-double-right fs-2"/>;
        } else if (cardType === 'ready' && first) {
            return <i className="fas fa-check-double fs-3"/>;
        } else if (cardType === 'ready' && !first) {
            return <i className="fas fa-angle-double-up fs-2"/>;
        }
    }

    const getButtonVariant = () => {
        if (cardType === 'await' || (cardType === 'in_work' && !first)) {
            switch (urgency) {
                case 1:
                    return "redBtn"
                case 2:
                    return "yellowBtn"
                case 3:
                    return "greenBtn"
                case 4:
                    return "greyBtn"
                default:
                    return "greenBtn"
            }
        }
        return "greenBtn"
    }

    if (cardType === 'await' && !first) {
        return (<></>);
    }

    return (
        <button className={'appBtn p-1 rounded rounded-2 h-100 ' + getButtonVariant()} {...otherProps}>
            {otherProps.disabled ? <Spinner animation={'grow'} size={'sm'}/> : getButtonIcon()}
        </button>
    );
});
