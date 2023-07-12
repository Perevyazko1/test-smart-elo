import React, {ReactNode, useState} from 'react';
import {Modal} from "react-bootstrap";

import {classNames, Mods} from "shared/lib/classNames/classNames";

interface AppModalProps {
    title: string,
    onHide: () => void,
    className?: string
    children?: ReactNode
}


export const AppModal = (props: AppModalProps) => {
    const {
        onHide,
        className,
        children,
        title,
    } = props

    const [showModal, setShowModal] = useState(true)

    const hide_modal = () => {
        setShowModal(false)
        setTimeout(() => {
            onHide()
        }, 300)
    }

    const mods: Mods = {};

    return (
        <Modal show={showModal}
               onHide={hide_modal}
               size={'xl'}
               scrollable={true}
               className={classNames('', mods, [className])}
        >
            <Modal.Header closeButton className={'p-3'}>
                <Modal.Title className={'fs-6'}>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {children}
            </Modal.Body>

        </Modal>
    );
};