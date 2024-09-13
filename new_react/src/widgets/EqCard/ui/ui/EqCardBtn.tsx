import {ButtonHTMLAttributes, useMemo} from "react";
import {Spinner} from "react-bootstrap";

import {useClickSound} from "@shared/hooks";
import {ListTypes} from "@widgets/EqCardList";


interface EqCardBtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    cardType: ListTypes,
    first: boolean,
    urgency: number,
    locked?: boolean,
    plane_date?: string | null;
    expanded?: boolean;
}

export const EqCardBtn = (props: EqCardBtnProps) => {
    const {cardType, urgency, first, locked, plane_date, onClick, expanded, ...otherProps} = props;
    const playSound = useClickSound();

    const planeDateTime: { date: string, time: string } = useMemo(() => {
        if (!plane_date) {
            return {date: '', time: ''};
        }

        const dateTime = new Date(plane_date);
        const date = dateTime.toLocaleDateString(
            'ru-RU',
            {day: '2-digit', month: '2-digit'}
        );
        const time = dateTime.toLocaleTimeString(
            'ru-RU',
            {hour: '2-digit', minute: '2-digit'}
        );

        return {date: date, time: time};
    }, [plane_date])

    const getButtonIcon = useMemo(() => {
        if (cardType === 'await') {
            return <i className="fas fa-angle-double-left fs-2"/>;
        } else if (locked) {
            return <i className="fas fa-lock fs-5"/>;
        } else if (cardType === 'in_work' && first && expanded) {
            return <i className="fas fa-angle-double-left fs-2"/>;
        } else if (cardType === 'in_work' && first) {
            return <i className="fas fa-check fs-3"/>;
        } else if (cardType === 'distribute' && !first) {
            return <i className="fas fa-angle-double-right fs-2"/>;
        } else if (cardType === 'in_work' && !first && expanded) {
            return <i className="fas fa-angle-double-down fs-2"/>
        } else if (cardType === 'in_work' && !first) {
            return <i className="fas fa-angle-double-right fs-2"/>;
        } else if (cardType === 'ready' && first) {
            return <i className="fas fa-check-double fs-3"/>;
        } else if (cardType === 'ready' && !first) {
            return <i className="fas fa-angle-double-up fs-2"/>;
        }
    }, [cardType, expanded, first, locked])

    const getButtonVariant = useMemo(() => {
        if ((first && cardType === 'await') ||
            (!first && cardType === 'distribute') ||
            (cardType === 'in_work' && expanded && first) ||
            (cardType === 'in_work' && !expanded && !first) ||
            (cardType === 'ready' && !first))
        {
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
    }, [cardType, expanded, first, urgency]);

    return (
        <button
            onClick={(e) => {
                playSound()
                onClick && onClick(e)
            }}
            className={'appBtn p-1 rounded rounded-2 h-100 ' + getButtonVariant}
            {...otherProps}
        >
            <div className={'fs-7'}>
                <b>{planeDateTime.date}</b>
                <br/>
                {planeDateTime.time}
            </div>
            <br/>
            {otherProps.disabled ? <Spinner animation={'grow'} size={'sm'}/> : getButtonIcon}
        </button>
    );
};
