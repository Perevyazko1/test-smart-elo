import React from "react";
import {Link} from "react-router-dom";

import {OrderDetailWidget} from "@widgets/OrderDetailWidget";
import {useAppModal} from "@shared/hooks";

import {OrderItem} from "../model/types";

export const OrderRow = (props: { order: OrderItem }) => {
    const {openModal} = useAppModal();

    const onClickHandler = () => {
        openModal({
                content: (
                    <OrderDetailWidget order_id={props.order.id}/>
                )
            }
        )
    }
    return (
        <tr onClick={onClickHandler} style={{height: '40px'}}>
            <td>
                <Link to={`/orders/${props.order.id}`}>
                    {props.order.number}
                </Link>
            </td>
            <td>{props.order.inner_number}</td>
            <td>{props.order.urgency}</td>
            <td>{props.order.project}</td>
            <td>
                {
                    props.order.status === "0" ?
                        "В работе"
                        :
                        "Завершен"
                }
            </td>
            <td>{props.order.planned_date}</td>
        </tr>
    );
};
