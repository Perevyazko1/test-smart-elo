import React, {memo} from 'react';
import {Button, Table} from "react-bootstrap";

import {getHumansDatetime} from "shared/lib/getHumansDatetime/getHumansDatetime";
import {eq_card} from "entities/EqPageCard";
import {Link} from "react-router-dom";
import {AppRoutes} from "../../../../app/providers/Router";
import {useAppSelector} from "../../../../shared/lib/hooks/useAppSelector/useAppSelector";
import {getCurrentDepartment} from "../../../../entities/Employee";

interface OpCardDetailsProps {
    eqCard: eq_card;
    className?: string;
}


export const OpCardDetails = memo((props: OpCardDetailsProps) => {
    const {
        className,
        eqCard
    } = props;

    const currentDepartment = useAppSelector(getCurrentDepartment)

    return (
        <>
            <Table
                className={className}
                striped
                bordered
                hover
            >
                <thead>
                <tr>
                    <th>#</th>
                    <th>Детали</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td>Изделие</td>
                    <td>{eqCard.product.name}</td>
                </tr>

                <tr>
                    <td>Количество</td>
                    <td>{eqCard.card_info.count_all} ед.</td>
                </tr>

                <tr>
                    <td>№ Заказа / Серия</td>
                    <td>{eqCard.series_id}</td>
                </tr>

                <tr>
                    <td>Дата заказа</td>
                    <td>{getHumansDatetime(eqCard.order.moment).slice(0, 10)}</td>
                </tr>

                <tr>
                    <td>План дата производства заказа</td>
                    <td>{getHumansDatetime(eqCard.order.planned_date).slice(0, 10)}</td>
                </tr>

                <tr>
                    <td>Проект</td>
                    <td>{eqCard.order.project}</td>
                </tr>

                <tr>
                    <td>Комментарий чехол</td>
                    <td>{eqCard.comment_case}</td>
                </tr>
                <tr>
                    <td>Комментарий каркас</td>
                    <td>{eqCard.comment_case}</td>
                </tr>
                {eqCard.main_fabric &&
                    <tr>
                        <td>Основная ткань</td>
                        <td>{eqCard.main_fabric?.name}</td>
                    </tr>
                }
                {eqCard.second_fabric &&
                    <tr>
                        <td>Доп 1 ткань</td>
                        <td>{eqCard.second_fabric?.name}</td>
                    </tr>
                }
                {eqCard.third_fabric &&
                    <tr>
                        <td>Доп 2 ткань</td>
                        <td>{eqCard.third_fabric?.name}</td>
                    </tr>
                }

                </tbody>

            </Table>
            <Link to={
                `/${AppRoutes.ASSIGNMENTS}?order_product__series_id=${eqCard.series_id}&department__name=${currentDepartment?.name}`
            }>
                <Button
                    className={'m-2'}
                    size={'sm'}
                >
                    Просмотреть наряды по серии
                </Button>
            </Link>
        </>
    );
});