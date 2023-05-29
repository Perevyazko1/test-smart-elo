import React, {memo, useEffect} from 'react';
import {useSelector} from "react-redux";
import {CSSTransition, TransitionGroup} from "react-transition-group";

import {StickyHeader} from "shared/ui/StickyHeader/StickyHeader";
import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";
import {CardType, OrderProductCard} from "widgets/OrderProductCard";
import {getCurrentDepartment, getEmployeePinCode} from "entities/Employee";

import {fetchReadyList} from "../../model/service/fetchReadyList/fetchReadyList";
import {getWeekInfo} from "../../model/selectors/getWeekInfo/getWeekInfo";
import {getCurrentProject} from "../../model/selectors/getCurrentProject/getCurrentProject";
import {getCurrentViewMod} from "../../model/selectors/getCurrentViewMod/getCurrentViewMod";
import {getReadyData} from "../../model/selectors/getReadyData/getReadyData";


export const EqReadyBlock = memo(() => {
    const dispatch = useAppDispatch()

    const ready_data = useSelector(getReadyData)
    const week_info = useSelector(getWeekInfo)
    const current_project = useSelector(getCurrentProject)
    const pin_code = useSelector(getEmployeePinCode)
    const current_department = useSelector(getCurrentDepartment)
    const view_mode = useSelector(getCurrentViewMod)

    useEffect(() => {
        if (current_department && pin_code) {
            dispatch(fetchReadyList({
                department_number: current_department.number,
                project: current_project,
                pin_code: pin_code,
                view_mode: view_mode.key,
                week: week_info?.week,
                year: week_info?.year
            }))
        }
    }, [ready_data?.has_updated, view_mode, current_project, week_info, dispatch, pin_code, current_department])

    return (
        <div className="row m-0" style={{height: "43vh", overflow: "auto", overflowX: "hidden", overflowY: "auto",}}>
            <div className="col m-0 p-1">

                <StickyHeader loading={ready_data?.is_loading}>Список готовых изделий</StickyHeader>

                {/*<TransitionGroup>*/}

                {/*    {ready_data?.data?.entities.getAll((order_product) => (*/}
                {/*        <CSSTransition*/}
                {/*            key={order_product.series_id}*/}
                {/*            timeout={500}*/}
                {/*            classNames="fade"*/}
                {/*        >*/}
                {/*            <div>*/}
                {/*                <OrderProductCard*/}
                {/*                    order_product={order_product}*/}
                {/*                    key={order_product.series_id}*/}
                {/*                    card_type={CardType.READY_CARD}*/}
                {/*                    disabled={ready_data?.is_loading}*/}
                {/*                />*/}
                {/*            </div>*/}
                {/*        </CSSTransition>*/}
                {/*    ))}*/}

                {/*</TransitionGroup>*/}

            </div>
        </div>
    );
});