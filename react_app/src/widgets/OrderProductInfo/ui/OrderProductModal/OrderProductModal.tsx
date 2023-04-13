import React, {memo, useState} from 'react';
import {Accordion, Button, Modal} from "react-bootstrap";

import {DynamicModuleLoader, ReducersList} from "shared/components/DynamicModuleLoader/DynamicModuleLoader";

import {orderProductInfoReducer} from "../../model/slice/OrderProductInfoSlice";
import {OrderProductCardContext} from "../../../../pages/EQPage/model/types/eqSchema";
import {OPProductionInfoTable} from "../OPDepartmentInfoTable/OPProductionInfoTable";
import {OPTechProcessTable} from "../OPTechProcessTable/OPTechProcessTable";


const initialReducers: ReducersList = {
    'orderProductInfo': orderProductInfoReducer
}

export interface OrderProductModalProps {
    onHide: () => void,
    card_info: OrderProductCardContext,
}

export const OrderProductModal = memo((props: OrderProductModalProps) => {
    const [showModal, setShowModal] = useState(true)

    const hide_modal = () => {
        setShowModal(false)
        setTimeout(() => {
            props.onHide()
        }, 300)
    }

    return (
        <DynamicModuleLoader reducers={initialReducers}>
            <Modal show={showModal} onHide={hide_modal} size={'xl'} scrollable={true}>
                <Modal.Header closeButton>
                    <Modal.Title>Информация по изделию {props.card_info.order_product_id}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Accordion alwaysOpen>
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>Просмотреть информацию по отделу</Accordion.Header>
                            <Accordion.Body>
                                <OPProductionInfoTable/>
                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey="1">
                            <Accordion.Header>Просмотреть информацию по производству</Accordion.Header>
                            <Accordion.Body>
                                <OPProductionInfoTable/>
                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey="2">
                            <Accordion.Header>Просмотреть информацию по технологическому процессу</Accordion.Header>
                            <Accordion.Body>
                                <OPTechProcessTable/>
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={hide_modal}>
                        Закрыть
                    </Button>
                    <Button variant="primary" onClick={hide_modal}>
                        Сохранить
                    </Button>
                </Modal.Footer>
            </Modal>
        </DynamicModuleLoader>
    );
});