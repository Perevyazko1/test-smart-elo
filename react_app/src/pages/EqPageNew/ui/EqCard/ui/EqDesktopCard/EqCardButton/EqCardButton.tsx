import React, {memo} from 'react';
import {Button, Spinner} from "react-bootstrap";
import {ButtonProps} from "react-bootstrap/Button";

import {classNames} from "shared/lib/classNames/classNames";

import cls from "../EqDesktopCard/EqDesktopCard.module.scss";

interface EqCardButtonProps extends ButtonProps {
    cardType: 'await' | 'in_work' | 'ready',
    first: boolean,
    urgency: number,
    isDisabled: boolean,
}


export const EqCardButton = memo((props: EqCardButtonProps) => {
    const {
        className,
        cardType,
        first,
        urgency,
        isDisabled,
        ...otherProps
    } = props;

    const getButtonIcon = () => {
        if (cardType === 'await') {
            return <i className="fas fa-angle-double-left fs-2"/>
        } else if (cardType === 'in_work' && first) {
            return <i className="fas fa-check fs-3"/>
        } else if (cardType === 'in_work' && !first) {
            return <i className="fas fa-angle-double-right fs-2"/>
        } else if (cardType === 'ready' && first) {
            return <i className="fas fa-check-double fs-3"/>
        } else if (cardType === 'ready' && !first) {
            return <i className="fas fa-angle-double-up fs-2"/>
        }
    }

    const getButtonVariant = () => {
        if (cardType === 'await' || (cardType === 'in_work' && !first)) {
            switch (urgency) {
                case 1:
                    return "danger"
                case 2:
                    return "warning"
                case 3:
                    return "success"
                case 4:
                    return "secondary"
                default:
                    return "success"
            }
        }
        return "success"
    }

    return (
        <Button
            className={classNames(cls.cardBtn, {}, [className])}
            type="button"
            variant={getButtonVariant()}
            disabled={isDisabled}
            {...otherProps}
        >
            <div>
                {isDisabled ? <Spinner animation={'grow'} size={'sm'}/> : getButtonIcon()}
            </div>
        </Button>
    );
});