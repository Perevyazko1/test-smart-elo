import React, {memo} from 'react';
import {useSelector} from "react-redux";

import {StickyHeader} from "shared/ui/StickyHeader/StickyHeader";
import {CardType, OrderProductCard} from "widgets/OrderProductCard";

import {getAwaitList} from "../../model/selectors/getAwaitList/getAwaitList";

import {TransitionGroup, CSSTransition} from "react-transition-group";


export const EqAwaitBlock = memo(() => {
    const await_list = useSelector(getAwaitList)

    return (
        <div className="col p-1 m-0 w-50"
             style={{
                 height: "93vh", overflow: "auto", overflowX: "hidden", overflowY: "auto",
                 borderLeftWidth: "4px", borderLeftStyle: "solid"
             }}
        >
            <StickyHeader>Список изделий в очереди</StickyHeader>

            <TransitionGroup>
                {
                    await_list?.results?.map((order_product) => (
                        <CSSTransition
                            key={order_product.series_id}
                            timeout={500}
                            classNames="fade"
                        >
                            <div>
                                <OrderProductCard
                                    order_product={order_product}
                                    card_type={CardType.AWAIT_CARD}
                                />
                            </div>
                        </CSSTransition>
                    ))
                }
            </TransitionGroup>
        </div>
    );
});