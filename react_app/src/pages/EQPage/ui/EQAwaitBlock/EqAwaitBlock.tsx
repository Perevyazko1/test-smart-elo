import React, {memo} from 'react';
import {useSelector} from "react-redux";

import {StickyHeader} from "shared/ui/StickyHeader/StickyHeader";
import {CardType, OrderProductCard} from "widgets/OrderProductCard/ui/OrderProductCard";

import {getAwaitList} from "../../model/selectors/getAwaitList/getAwaitList";


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

            {await_list?.results?.length
                ?
                await_list.results.map((order_product) => (
                    <OrderProductCard
                        order_product={order_product}
                        key={order_product.series_id}
                        card_type={CardType.AWAIT_CARD}
                    />
                ))
                : <div>Нет нарядов</div>
            }
        </div>
    );
});