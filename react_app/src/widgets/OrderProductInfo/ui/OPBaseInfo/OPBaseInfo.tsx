import React, {memo} from 'react';
import {Table} from "react-bootstrap";

import {order_product} from "entities/OrderProduct";
import {classNames, Mods} from "shared/lib/classNames/classNames";
import {getHumansDatetime} from "shared/lib/getHumansDatetime/getHumansDatetime";

interface OpBaseInfoProps {
    order_product: order_product,
    className?: string
}


export const OpBaseInfo = memo((props: OpBaseInfoProps) => {
    const {
        order_product,
        className,
        ...otherProps
    } = props

    const mods: Mods = {};

    return (
        <div
            className={classNames('', mods, [className])}
            {...otherProps}
        >
            <Table striped bordered hover>
                <thead>
                <tr>
                    <th>#</th>
                    <th>Детали</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td>№ Заказа</td>
                    <td>{order_product.series_id}</td>
                </tr>
                <tr>
                    <td>Дата заказа</td>
                    <td>{getHumansDatetime(order_product.order.moment).slice(0, 10)}</td>
                </tr>

                <tr>
                    <td>План дата производства заказа</td>
                    <td>{getHumansDatetime(order_product.order.planned_date).slice(0, 10)}</td>
                </tr>

                <tr>
                    <td>Проект</td>
                    <td>{order_product.order.project}</td>
                </tr>
                <tr>
                    <td>Изделие</td>
                    <td>{order_product.product.name}</td>
                </tr>
                <tr>
                    <td>Комментарий чехол</td>
                    <td>{order_product.comment_case}</td>
                </tr>
                <tr>
                    <td>Комментарий каркас</td>
                    <td>{order_product.comment_case}</td>
                </tr>
                {order_product.main_fabric &&
                    <tr>
                        <td>Основная ткань</td>
                        <td>{order_product.main_fabric?.name}</td>
                    </tr>
                }
                {order_product.second_fabric &&
                    <tr>
                        <td>Доп 1 ткань</td>
                        <td>{order_product.second_fabric?.name}</td>
                    </tr>
                }
                {order_product.third_fabric &&
                    <tr>
                        <td>Доп 2 ткань</td>
                        <td>{order_product.third_fabric?.name}</td>
                    </tr>
                }

                </tbody>
            </Table>
        </div>
    );
});