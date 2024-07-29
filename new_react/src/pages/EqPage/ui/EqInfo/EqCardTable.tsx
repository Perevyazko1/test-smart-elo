import {Button, Table} from "react-bootstrap";
import {getHumansDatetime} from "@shared/lib";
import {IndicatorWrapper} from "@shared/ui";
import {Link} from "react-router-dom";
import {useCurrentUser, usePermission} from "@shared/hooks";
import {APP_PERM} from "@shared/consts";
import {EqOrderProduct} from "@widgets/EqCardList";


interface EqCardTableProps {
    card: EqOrderProduct;
}

export const EqCardTable = (props: EqCardTableProps) => {
    const {card} = props;
    const {currentUser} = useCurrentUser();
    const productPerm = usePermission(APP_PERM.PRODUCT_PAGE);

    return (
        <>
            <Table
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
                    <td>
                        {card.product.name}
                        {productPerm &&
                            <Link to={
                                `/product/${card.product.id}`
                            }>
                                <Button
                                    size={'sm'}
                                    className={'mx-2'}
                                    variant={'outline-secondary'}
                                >
                                    Подробнее
                                </Button>
                            </Link>
                        }
                    </td>
                </tr>

                <tr>
                    <td>Количество</td>
                    <td>{card.card_info.count_all} ед.</td>
                </tr>

                <tr>
                    <td>№ Заказа / Серия</td>
                    <td>{card.series_id}</td>
                </tr>

                <tr>
                    <td>Дата заказа</td>
                    <td>{getHumansDatetime(card.order.moment).slice(0, 10)}</td>
                </tr>

                <tr>
                    <td>План дата производства заказа</td>
                    <td>{
                        card.order.planned_date
                            ?
                            getHumansDatetime(card.order.planned_date).slice(0, 10)
                            : 'БД'
                    }</td>
                </tr>

                <tr>
                    <td>Проект</td>
                    <td>{card.order.project}</td>
                </tr>

                <tr>
                    <td>
                        <IndicatorWrapper
                            indicator={'comment'}
                            show={!!card.order.comment_case}
                            color={' bg-warning'}
                        >
                            Комментарий чехол
                        </IndicatorWrapper>
                    </td>
                    <td>{card.order.comment_case}</td>
                </tr>
                <tr>
                    <td>
                        <IndicatorWrapper
                            indicator={'comment'}
                            show={!!card.order.comment_base}
                            color={' bg-warning'}
                        >
                            Комментарий каркас
                        </IndicatorWrapper>
                    </td>
                    <td>{card.order.comment_base}</td>
                </tr>
                {card.main_fabric &&
                    <tr>
                        <td>Основная ткань</td>
                        <td>{card.main_fabric?.name}</td>
                    </tr>
                }
                {card.second_fabric &&
                    <tr>
                        <td>Доп 1 ткань</td>
                        <td>{card.second_fabric?.name}</td>
                    </tr>
                }
                {card.third_fabric &&
                    <tr>
                        <td>Доп 2 ткань</td>
                        <td>{card.third_fabric?.name}</td>
                    </tr>
                }

                </tbody>

            </Table>
            <Link to={
                `/assignment/?order_product__series_id=${card.series_id}&department__name=${currentUser.current_department?.name || ''}`
            }>
                <Button
                    className={'m-2'}
                    size={'sm'}
                >
                    Просмотреть наряды по серии
                </Button>
            </Link>

            <Link
                to={`/tariffication?product__name=${card.product.name}`}
            >
                <Button
                    className={'m-2'}
                    size={'sm'}
                >
                    Просмотреть тарификации
                </Button>
            </Link>
        </>
    );
};
