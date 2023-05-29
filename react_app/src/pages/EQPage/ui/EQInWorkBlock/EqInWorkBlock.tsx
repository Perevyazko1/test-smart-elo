import React, {memo, useEffect} from 'react';
import {useSelector} from "react-redux";
import {TransitionGroup, CSSTransition} from "react-transition-group";

import {StickyHeader} from "shared/ui/StickyHeader/StickyHeader";
import {CardType, OrderProductCard} from "widgets/OrderProductCard";
import {getCurrentDepartment, getEmployeePinCode} from "entities/Employee";
import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";

import {fetchInWorkList} from "../../model/service/fetchInWorkList/fetchInWorkList";
import {getCurrentProject} from "../../model/selectors/getCurrentProject/getCurrentProject";
import {getCurrentViewMod} from "../../model/selectors/getCurrentViewMod/getCurrentViewMod";
import {getInWorkData} from "../../model/selectors/getInWorkData/getInWorkData";


export const EqInWorkBlock = memo(() => {
    const in_work_data = useSelector(getInWorkData)
    const dispatch = useAppDispatch()

    const current_department = useSelector(getCurrentDepartment)
    const current_project = useSelector(getCurrentProject)
    const view_mode = useSelector(getCurrentViewMod)
    const pin_code = useSelector(getEmployeePinCode)

    useEffect(() => {
        if (current_department && pin_code) {
            dispatch(fetchInWorkList({
                department_number: current_department.number,
                project: current_project,
                pin_code: pin_code,
                view_mode: view_mode.key,
            }))
        }
    }, [current_department, current_project, dispatch, in_work_data?.has_updated, pin_code, view_mode])

    return (
        <div className="row m-0" style={{height: "43vh", overflow: "auto", overflowX: "hidden", overflowY: "auto",}}>
            <div className="col p-1 m-0">

                <StickyHeader loading={in_work_data?.is_loading}>Список изделий в работе</StickyHeader>

                {/*<TransitionGroup>*/}

                {/*    {in_work_data?.data?.results?.map((order_product) => (*/}
                {/*        <CSSTransition*/}
                {/*            key={order_product.series_id}*/}
                {/*            timeout={500}*/}
                {/*            classNames="fade"*/}
                {/*        >*/}
                {/*            <div>*/}
                {/*                <OrderProductCard*/}
                {/*                    order_product={order_product}*/}
                {/*                    key={order_product.series_id}*/}
                {/*                    card_type={CardType.IN_WORK_CARD}*/}
                {/*                    disabled={in_work_data?.is_loading}*/}
                {/*                />*/}
                {/*            </div>*/}
                {/*        </CSSTransition>*/}
                {/*    ))}*/}

                {/*</TransitionGroup>*/}
            </div>
        </div>
    );
});