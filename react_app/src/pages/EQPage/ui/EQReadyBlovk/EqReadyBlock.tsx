import React, {memo} from 'react';
import {useSelector} from "react-redux";

import {StickyHeader} from "shared/ui/StickyHeader/StickyHeader";
import {CardType, OrderProductCard} from "widgets/OrderProductCard/ui/OrderProductCard";

import {getReadyList} from "../../model/selectors/getReadyList/getReadyList";

export const EqReadyBlock = memo(() => {
    const ready_list = useSelector(getReadyList)

    return (
        <div className="row m-0" style={{height: "43vh", overflowX: "auto"}}>
            <div className="col m-0 p-1">
                <StickyHeader>Список готовых изделий</StickyHeader>

                {ready_list?.results?.length
                    ?
                    ready_list.results.map((order_product) => (
                        <OrderProductCard
                            order_product={order_product}
                            key={order_product.series_id}
                            card_type={CardType.READY_CARD}
                        />
                    ))
                    : <div>Нет нарядов</div>
                }
            </div>
        </div>
    );
});