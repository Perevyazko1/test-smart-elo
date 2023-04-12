import React, {memo, useEffect} from 'react';
import {useSelector} from "react-redux";

import {StickyHeader} from "shared/ui/StickyHeader/StickyHeader";
import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";
import {CardType, OrderProductCard} from "widgets/OrderProductCard/ui/OrderProductCard";

import {fetchReadyList} from "../../model/service/fetchReadyList/fetchReadyList";
import {getEqUpdated} from "../../model/selectors/getEqUpdated/getEqUpdated";
import {getWeekInfo} from "../../model/selectors/getWeekInfo/getWeekInfo";
import {getReadyList} from "../../model/selectors/getReadyList/getReadyList";

export const EqReadyBlock = memo(() => {
    const ready_list = useSelector(getReadyList)
    const dispatch = useAppDispatch()
    const eqUpdated = useSelector(getEqUpdated)
    const week_info = useSelector(getWeekInfo)


    useEffect(() => {
        dispatch(fetchReadyList({
            department_number: 1,
            project: 'all',
            pin_code: 123123,
            view_mode: 'all',
            series_size: 1,
            week: week_info?.week,
            year: week_info?.year
        }))
    }, [eqUpdated, week_info, dispatch])

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