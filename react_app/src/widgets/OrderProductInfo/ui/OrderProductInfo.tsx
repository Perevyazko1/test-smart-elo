import React, {memo, useEffect} from 'react';
import {Accordion, Button, Modal} from "react-bootstrap";

import {order_product} from "entities/OrderProduct";
import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";
import {DynamicModuleLoader, ReducersList} from "shared/components/DynamicModuleLoader/DynamicModuleLoader";

import {orderProductInfoActions, orderProductInfoReducer} from "../model/slice/OrderProductInfoSlice";
import {OPProductionInfoTable} from "./OPProductionInfoTable/OPProductionInfoTable";
import {OPTechProcessTable} from "./OPTechProcessTable/OPTechProcessTable";
import {OpBaseInfo} from "./OPBaseInfo/OPBaseInfo";
import {OpDepartmentInfoTable} from "./OPDepartmentInfoTable/OPDepartmentInfoTable";
import {AppModal} from "../../../shared/ui/AppModal/AppModal";
import {IndicatorWrapper} from "../../../shared/ui/IndicatorWrapper/IndicatorWrapper";


const initialReducers: ReducersList = {
    'orderProductInfo': orderProductInfoReducer
}

export interface OrderProductInfoProps {
    onHide: () => void,
    order_product: order_product,
}

export const OrderProductInfo = memo((props: OrderProductInfoProps) => {
    const {onHide, order_product} = props

    const dispatch = useAppDispatch()

    useEffect(() => {
        if (!order_product.product.technological_process) {
            dispatch(orderProductInfoActions.setChangeTP(true))
        }
    }, [dispatch, order_product.product.technological_process])

    const tech_process_confirmed = !order_product?.product?.technological_process

    return (
        <DynamicModuleLoader reducers={initialReducers}>
            <AppModal onHide={onHide}
                      className={'d-flex flex-column'}
                      title={`Информация по изделию ${props.order_product.product.name}`}
            >
                <OpBaseInfo order_product={order_product}/>

                <Accordion alwaysOpen>
                    <Accordion.Item eventKey="0">
                        <Accordion.Header>Просмотреть информацию по отделу</Accordion.Header>
                        <Accordion.Body>
                            <OpDepartmentInfoTable order_product={order_product}/>
                        </Accordion.Body>
                    </Accordion.Item>

                    <Accordion.Item eventKey="1">
                        <Accordion.Header>Просмотреть информацию по производству</Accordion.Header>
                        <Accordion.Body>
                            <OPProductionInfoTable order_product={order_product}/>
                        </Accordion.Body>
                    </Accordion.Item>

                    <Accordion.Item eventKey="2" className={'gb-dark'}>
                        <Accordion.Header>
                            {tech_process_confirmed
                                ?
                                <IndicatorWrapper indicator={'tech-process'}
                                                  className={'bg-danger'}
                                                  right={'-10px'}
                                >
                                    <div className={'mx-2 fw-bold'}>
                                        Технологический процесс не выбран!
                                    </div>
                                </IndicatorWrapper>
                                :
                                <div>
                                    Просмотреть информацию по технологическому процессу
                                </div>
                            }
                        </Accordion.Header>

                        <Accordion.Body>
                            <OPTechProcessTable order_product={order_product}/>
                        </Accordion.Body>

                    </Accordion.Item>

                </Accordion>

            </AppModal>
        </DynamicModuleLoader>
    );
});