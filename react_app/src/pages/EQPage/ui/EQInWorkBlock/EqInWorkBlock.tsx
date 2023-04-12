import React, {memo} from 'react';
import {useSelector} from "react-redux";

import {StickyHeader} from "shared/ui/StickyHeader/StickyHeader";
import {CardType, OrderProductCard} from "widgets/OrderProductCard/ui/OrderProductCard";

import {getInWorkList} from "../../model/selectors/getInWorkList/getInWorkList";
import {TransitionGroup, CSSTransition} from "react-transition-group";


export const EqInWorkBlock = memo(() => {
    const in_work_list = useSelector(getInWorkList)

    return (
        <div className="row m-0" style={{height: "43vh", overflowX: "auto"}}>
            <div className="col p-1 m-0">
                <StickyHeader>Список изделий в работе</StickyHeader>

                <TransitionGroup>

                    {in_work_list?.results?.map((order_product) => (
                        <CSSTransition
                            key={order_product.series_id}
                            timeout={500}
                            classNames="fade"
                        >
                            <div>
                                <OrderProductCard
                                    order_product={order_product}
                                    key={order_product.series_id}
                                    card_type={CardType.IN_WORK_CARD}
                                />
                            </div>
                        </CSSTransition>
                    ))}

                </TransitionGroup>
            </div>
        </div>
    );
});