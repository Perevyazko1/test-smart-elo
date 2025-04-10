import {useParams} from "react-router-dom";

import cls from "./OrderDetailPage.module.scss";

import {ModalProvider} from "@app";
import React from "react";
import {AppNavbar} from "@widgets/AppNavbar";
import {OrderDetailWidget} from "@widgets/OrderDetailWidget";
import {Container} from "react-bootstrap";

export const OrderDetailPage = () => {
    const {order_id} = useParams();

    return (
        <ModalProvider>
            <div className={cls.pageContainer}>
                <AppNavbar/>

                <Container>
                    <OrderDetailWidget order_id={Number(order_id)}/>
                </Container>
            </div>
        </ModalProvider>
    );
};
