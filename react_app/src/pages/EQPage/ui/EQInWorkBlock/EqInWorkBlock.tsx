import React, {memo, useEffect} from 'react';
import {useSelector} from "react-redux";
import {TransitionGroup, CSSTransition} from "react-transition-group";

import {StickyHeader} from "shared/ui/StickyHeader/StickyHeader";
import {CardType, OrderProductCard} from "widgets/OrderProductCard";
import {getCurrentDepartment, getEmployeePinCode} from "entities/Employee";
import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";

import {getInWorkList} from "../../model/selectors/getInWorkList/getInWorkList";
import {fetchInWorkList} from "../../model/service/fetchInWorkList/fetchInWorkList";
import {getCurrentProject} from "../../model/selectors/getCurrentProject/getCurrentProject";
import {getCurrentViewMod} from "../../model/selectors/getCurrentViewMod/getCurrentViewMod";
import {getInWorkListUpdated} from "../../model/selectors/getInWorkListUpdated/getAwaitListUpdated";
import {getInWorkListIsLoading} from "../../model/selectors/getInWorkListIsLoading/getInWorkListIsLoading";


export const EqInWorkBlock = memo(() => {
    const in_work_list = useSelector(getInWorkList)
    const dispatch = useAppDispatch()

    const current_department = useSelector(getCurrentDepartment)
    const in_work_list_updated = useSelector(getInWorkListUpdated)
    const in_work_list_is_loading = useSelector(getInWorkListIsLoading)
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
    }, [current_department, current_project, dispatch, in_work_list_updated, pin_code, view_mode.key])

    return (
        <div className="row m-0" style={{height: "43vh", overflow: "auto", overflowX: "hidden", overflowY: "auto",}}>
            <div className="col p-1 m-0">

                <StickyHeader loading={in_work_list_is_loading}>Список изделий в работе</StickyHeader>

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
                                    disabled={in_work_list_is_loading}
                                />
                            </div>
                        </CSSTransition>
                    ))}

                </TransitionGroup>
            </div>
        </div>
    );
});