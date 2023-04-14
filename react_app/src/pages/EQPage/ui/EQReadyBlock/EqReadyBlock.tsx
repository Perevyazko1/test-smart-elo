import React, {memo, useEffect} from 'react';
import {useSelector} from "react-redux";
import {CSSTransition, TransitionGroup} from "react-transition-group";

import {StickyHeader} from "shared/ui/StickyHeader/StickyHeader";
import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";
import {CardType, OrderProductCard} from "widgets/OrderProductCard";
import {getEmployeeAuthData} from "entities/Employee";

import {fetchReadyList} from "../../model/service/fetchReadyList/fetchReadyList";
import {getEqUpdated} from "../../model/selectors/getEqUpdated/getEqUpdated";
import {getWeekInfo} from "../../model/selectors/getWeekInfo/getWeekInfo";
import {getReadyList} from "../../model/selectors/getReadyList/getReadyList";
import {getCurrentProject} from "../../model/selectors/getCurrentProject/getCurrentProject";
import {getCurrentViewMod} from "../../model/selectors/getCurrentViewMod/getCurrentViewMod";


export const EqReadyBlock = memo(() => {
    const ready_list = useSelector(getReadyList)
    const dispatch = useAppDispatch()
    const eqUpdated = useSelector(getEqUpdated)
    const week_info = useSelector(getWeekInfo)
    const current_project = useSelector(getCurrentProject)
    const authData = useSelector(getEmployeeAuthData)
    const view_mode = useSelector(getCurrentViewMod)

    useEffect(() => {
        if (authData?.current_department && authData?.pin_code && view_mode) {
            dispatch(fetchReadyList({
                department_number: authData?.current_department?.number,
                project: current_project,
                pin_code: authData?.pin_code,
                view_mode: view_mode.key,
                week: week_info?.week,
                year: week_info?.year
            }))
        }
    }, [authData, view_mode, current_project, eqUpdated, week_info, dispatch])

    return (
        <div className="row m-0" style={{height: "43vh", overflow: "auto", overflowX: "hidden", overflowY: "auto",}}>
            <div className="col m-0 p-1">
                <StickyHeader>Список готовых изделий</StickyHeader>

                <TransitionGroup>

                    {ready_list?.results?.map((order_product) => (
                        <CSSTransition
                            key={order_product.series_id}
                            timeout={500}
                            classNames="fade"
                        >
                            <div>
                                <OrderProductCard
                                    order_product={order_product}
                                    key={order_product.series_id}
                                    card_type={CardType.READY_CARD}
                                />
                            </div>
                        </CSSTransition>
                    ))}

                </TransitionGroup>

            </div>
        </div>
    );
});