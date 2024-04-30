import React, {useEffect, useMemo, useState} from "react";
import {Container, Spinner, Table} from "react-bootstrap";

import {DynamicComponent, ReducersList} from "@features";
import {useAppDispatch, useAppSelector} from "@shared/hooks";

import {getOrderData, getOrderProps} from "../model/selectors";
import {ordersDetailReducer} from "../model/slice";
import {fetchOrderDetail} from "../model/api/fetchOrderDetail";

import {OrderDetailPosition} from "./OrderDetailPosition";
import {AppSkeleton} from "@shared/ui";


const initialReducers: ReducersList = {
    orderDetail: ordersDetailReducer,
}

interface OrderDetailWidgetProps {
    order_id: number;
    scrollToId?: number;
}

export const OrderDetailWidget = (props: OrderDetailWidgetProps) => {
    const dispatch = useAppDispatch();
    const orderData = useAppSelector(getOrderData);
    const orderProps = useAppSelector(getOrderProps);
    
    const [scrollTo, setScrollTo] = useState(props.scrollToId)


    useEffect(() => {
        if (scrollTo && orderData) {
            const element = document.getElementById(`order-product-id-${scrollTo}`);
            if (element) {
                element.scrollIntoView({behavior: 'smooth', block: 'start'});
            }
            setScrollTo(undefined)
        }
    }, [orderData, scrollTo])

    const orderStatus = useMemo(() => {
        if (!orderData) {
            return {
                ready: 34,
                inWork: 33,
                awaitCount: 33,
            }
        }
        const ready = orderData.order_ready_info.ready / orderData.order_ready_info.all * 100;
        const inWork = orderData.order_ready_info.in_work / orderData.order_ready_info.all * 100;
        const awaitCount = 100 - ready - inWork;

        return {
            ready: ready,
            inWork: inWork,
            awaitCount: awaitCount,
        }
    }, [orderData])

    useEffect(() => {
        dispatch(fetchOrderDetail({
            order_id: props.order_id
        }))
    }, [dispatch, props.order_id])

    return (
        <DynamicComponent reducers={initialReducers}>
            <div style={{minWidth: '90vw'}}>
                <div className="d-flex align-items-center p-2">
                    <h4 className={'m-0'}>
                        Cпецификация
                        {orderProps.isLoading && <Spinner animation={'grow'} size={'sm'} className={'ms-2'}/>}
                    </h4>
                </div>
                <hr className={'p-0 me-2 mx-2 mt-0 w-25'}/>

                <Container data-bs-theme={'light'} fluid>
                    <Table striped bordered hover size="sm">
                        {orderData ?
                            <tbody>
                            <tr>
                                <td>Номер заказа</td>
                                <td>{orderData.number}</td>
                            </tr>
                            <tr>
                                <td>Вх. заказ (№)</td>
                                <td>#</td>
                            </tr>
                            <tr>
                                <td>Проект</td>
                                <td>{orderData.project}</td>
                            </tr>
                            <tr>
                                <td>Комментарий общий каркас:</td>
                                <td>
                                    {orderData.comment_base}
                                </td>
                            </tr>
                            <tr>
                                <td>Комментарий общий чехол:</td>
                                <td>
                                    {orderData.comment_case}
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={2}>
                                    <div className={'d-flex w-100'}>
                                        <div className={'bg-success'} style={{
                                            height: '10px',
                                            width: `${orderStatus.ready}%`,
                                        }}></div>
                                        <div className={'bg-danger'} style={{
                                            height: '10px',
                                            width: `${orderStatus.inWork}%`,
                                        }}></div>
                                        <div className={'bg-secondary'} style={{
                                            height: '10px',
                                            width: `${orderStatus.awaitCount}%`,
                                        }}></div>
                                    </div>
                                </td>
                            </tr>

                            </tbody>
                            :
                            <tbody>
                            <tr>
                                <td colSpan={2}><AppSkeleton/></td>
                            </tr>
                            <tr>
                                <td colSpan={2}><AppSkeleton/></td>
                            </tr>
                            <tr>
                                <td colSpan={2}><AppSkeleton/></td>
                            </tr>
                            <tr>
                                <td colSpan={2}><AppSkeleton/></td>
                            </tr>
                            <tr>
                                <td colSpan={2}><AppSkeleton/></td>
                            </tr>
                            </tbody>
                        }
                    </Table>

                    {orderData?.order_products.map(orderProduct => (
                        <OrderDetailPosition
                            orderProduct={orderProduct}
                            key={orderProduct.id}
                        />
                    ))}

                </Container>
            </div>
        </DynamicComponent>
    );
};
