import React, {memo, useState} from 'react';
import {Accordion, Button, Modal} from "react-bootstrap";

import {DynamicModuleLoader, ReducersList} from "shared/components/DynamicModuleLoader/DynamicModuleLoader";
import {order_product} from "entities/OrderProduct";

import {orderProductInfoReducer} from "../../model/slice/OrderProductInfoSlice";
import {OPProductionInfoTable} from "../OPProductionInfoTable/OPProductionInfoTable";
import {OPTechProcessTable} from "../OPTechProcessTable/OPTechProcessTable";
import {OpBaseInfo} from "../OPBaseInfo/OPBaseInfo";
import {OpDepartmentInfoTable} from "../OPDepartmentInfoTable/OPDepartmentInfoTable";


const initialReducers: ReducersList = {
    'orderProductInfo': orderProductInfoReducer
}

export interface OrderProductModalProps {
    onHide: () => void,
    order_product: order_product,
}

export const OrderProductModal = memo((props: OrderProductModalProps) => {
    const [showModal, setShowModal] = useState(true)

    const hide_modal = () => {
        setShowModal(false)
        setTimeout(() => {
            props.onHide()
        }, 300)
    }

    const tech_process_confirmed = !props.order_product?.product?.technological_process

    return (
        <DynamicModuleLoader reducers={initialReducers}>
            <Modal show={showModal} onHide={hide_modal} size={'xl'} scrollable={true} className={'d-flex flex-column'}>
                <Modal.Header closeButton>
                    <Modal.Title>Информация по изделию {props.order_product.product.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>

                    <OpBaseInfo order_product={props.order_product}/>

                    <Accordion alwaysOpen>
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>Просмотреть информацию по отделу</Accordion.Header>
                            <Accordion.Body>
                                <OpDepartmentInfoTable order_product={props.order_product}/>
                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey="1">
                            <Accordion.Header>Просмотреть информацию по производству</Accordion.Header>
                            <Accordion.Body>
                                <OPProductionInfoTable order_product={props.order_product}/>
                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey="2" className={'gb-dark'}>
                            <Accordion.Header>
                                {tech_process_confirmed
                                    ?
                                    <div className={'bg-warning mx-2 fw-bold'}>
                                        Технологический процесс не выбран!
                                    </div>
                                    :
                                    <div>
                                        Просмотреть информацию по технологическому процессу
                                    </div>
                                }
                            </Accordion.Header>
                            <Accordion.Body>
                                <OPTechProcessTable order_product={props.order_product}/>
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={hide_modal}>
                        Закрыть
                    </Button>
                </Modal.Footer>
            </Modal>
        </DynamicModuleLoader>
    );
});