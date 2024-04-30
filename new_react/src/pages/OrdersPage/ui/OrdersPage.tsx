import React, {useEffect, useMemo, useState} from "react";
import {Container, Table} from "react-bootstrap";

import cls from "./OrderPage.module.scss";

import {ModalProvider} from "@app";
import {DynamicComponent, PaginationContainer, ReducersList} from "@features";
import {AppNavbar} from "@widgets/AppNavbar";
import {useAppDispatch, useAppSelector} from "@shared/hooks";
import {getPaginationSize} from "@shared/lib";

import {fetchOrders} from "../model/api";
import {ordersPageReducer} from "../model/slice";
import {getOrdersList, getOrdersProps} from "../model/selectors";

import {OrderRow} from "./OrderRow";


const initialReducers: ReducersList = {
    orders: ordersPageReducer,
}

export const OrdersPage = () => {
    const dispatch = useAppDispatch();
    const ordersList = useAppSelector(getOrdersList);
    const ordersProps = useAppSelector(getOrdersProps);

    const [showCanvas, setShowCanvas] = useState<boolean>(false);

    // Считаем размер страницы для одного запроса
    const paginationSize = useMemo(() => {
        return getPaginationSize(window.innerHeight, 40, 1.6);
    }, []);

    // Состояние текущего запроса
    const [limitOffset, setLimitOffset] = useState({limit: paginationSize, offset: 0});

    const getOrders = (
        isNext: boolean = false,
        limit: number = limitOffset.limit,
        offset: number = limitOffset.offset
    ) => {
        dispatch(fetchOrders({
            isNext: isNext,
            limit: limit,
            offset: offset,
        }))
    };

    useEffect(() => {
        getOrders(false, paginationSize, 0)
        //eslint-disable-next-line
    }, [paginationSize]);

    const setNextPage = () => {
        setLimitOffset({
            limit: limitOffset.limit,
            offset: limitOffset.offset + paginationSize,
        })
    };

    // При изменении интервала страницы запрашиваем данные
    useEffect(() => {
        if (limitOffset.offset >= paginationSize) {
            getOrders(true);
        }
        //eslint-disable-next-line
    }, [limitOffset]);


    return (
        <DynamicComponent reducers={initialReducers}>
            <ModalProvider>
                <div className={cls.pageContainer}>
                    <AppNavbar showNav={showCanvas} closeClb={() => setShowCanvas(false)}>
                        Номер заказа, проект, статус
                    </AppNavbar>

                    <PaginationContainer
                        hasMore={!!ordersProps.next}
                        scroll_callback={setNextPage}
                        hasUpdated={!!ordersProps.hasUpdated}
                        data-bs-theme={'light'}
                        className={cls.pageContent}
                    >
                        <div className="d-flex align-items-center p-2">
                            <h4 className={'m-0'}>
                                Заказы
                                {/*{assignmentProps.isLoading && <Spinner animation={'grow'} size={'sm'}/>}*/}
                            </h4>
                        </div>
                        <hr className={'p-0 me-2 mx-2 mt-0 w-25'}/>


                        <Table striped bordered hover size="sm">
                            <thead>
                            <tr>
                                <th>№</th>
                                <th>Вх. заказ (№)</th>
                                <th>Срочность</th>
                                <th>Проект</th>
                                <th>Статус</th>
                                <th>План дата отгрузки</th>
                            </tr>
                            </thead>
                            <tbody>

                            {ordersList?.map(order => (
                                <OrderRow order={order} key={order.id}/>
                            ))}
                            </tbody>
                        </Table>

                    </PaginationContainer>
                </div>
            </ModalProvider>
        </DynamicComponent>
    );
};
