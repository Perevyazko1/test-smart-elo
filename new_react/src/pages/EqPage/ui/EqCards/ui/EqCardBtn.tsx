import {ButtonHTMLAttributes, memo, useMemo} from "react";
import {Spinner} from "react-bootstrap";

import {ListTypes} from "../../../model/consts/listTypes";
import {useClickSound} from "@shared/hooks";


interface EqCardBtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    cardType: ListTypes,
    first: boolean,
    urgency: number,
    locked?: boolean,
    plane_date?: string | null;
}

export const EqCardBtn = memo((props: EqCardBtnProps) => {
    const {cardType, urgency, first, locked, plane_date, onClick, ...otherProps} = props;
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
        <button
            onClick={(e) => {
                playSound()
                onClick && onClick(e)
            }}
            className={'appBtn p-1 rounded rounded-2 h-100 ' + getButtonVariant()}
            {...otherProps}
        >
            <div className={'fs-7'}>
                <b>{planeDateTime.date}</b>
                <br/>
                {planeDateTime.time}
            </div>
            <br/>
            {otherProps.disabled ? <Spinner animation={'grow'} size={'sm'}/> : getButtonIcon()}
        </button>
    );
});
