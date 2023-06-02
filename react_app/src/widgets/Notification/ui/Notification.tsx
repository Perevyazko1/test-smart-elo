import {memo, useState} from 'react';
import {Toast} from "react-bootstrap";

import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";
import {classNames, Mods} from "shared/lib/classNames/classNames";

import {notification} from "../model/types/notification";
import {notificationsActions} from "../model/slice/notificationSlice";

interface NotificationProps {
    notification: notification
    className?: string
}


export const Notification = memo((props: NotificationProps) => {
    const {
        notification,
        className,
        ...otherProps
    } = props
    const dispatch = useAppDispatch();
    const [show, setShow] = useState(true);

    const hideNotification = () => {
        setShow(false)
        setTimeout(() => {
            dispatch(notificationsActions.popNotification(notification.date))
        }, 1000)
    }

    const mods: Mods = {};

    return (
        <Toast bg={'light'}
               className={classNames('', mods, [className])}
               show={show}
               animation
               autohide={!notification.notAutoHide}
               delay={3000}
               style={{width: "250px"}}
               onClose={hideNotification}
               {...otherProps}
        >
            <Toast.Header>
                <strong className="me-auto">
                    {notification.title}
                </strong>
                <small className="text-muted">
                    {notification.type}
                </small>
            </Toast.Header>

            <Toast.Body className={"p-0 pb-1 px-2"}>
                {notification.body}
            </Toast.Body>

        </Toast>
    );
});