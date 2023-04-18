import React, {memo, useEffect} from 'react';
import {useSelector} from "react-redux";
import {TransitionGroup, CSSTransition} from "react-transition-group";

import {StickyHeader} from "shared/ui/StickyHeader/StickyHeader";
import {getCurrentDepartment, getEmployeePinCode} from "entities/Employee";
import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";
import {CardType, OrderProductCard} from "widgets/OrderProductCard";

import {getAwaitList} from "../../model/selectors/getAwaitList/getAwaitList";
import {fetchAwaitList} from "../../model/service/fetchAwaitList/fetchAwaitList";
import {getAwaitListUpdated} from "../../model/selectors/getAwaitListUpdated/getAwaitListUpdated";
import {getCurrentProject} from "../../model/selectors/getCurrentProject/getCurrentProject";
import {getCurrentViewMod} from "../../model/selectors/getCurrentViewMod/getCurrentViewMod";
import {getAwaitListIsLoading} from "../../model/selectors/getAwaitListIsLoading/getAwaitListIsLoading";


export const EqAwaitBlock = memo(() => {
    const await_list = useSelector(getAwaitList)
    const dispatch = useAppDispatch()

    const current_department = useSelector(getCurrentDepartment)
    const await_list_updated = useSelector(getAwaitListUpdated)
    const current_project = useSelector(getCurrentProject)
    const view_mode = useSelector(getCurrentViewMod)
    const pin_code = useSelector(getEmployeePinCode)
    const await_list_is_loading = useSelector(getAwaitListIsLoading)


    useEffect(() => {
        if (current_department && pin_code) {
            dispatch(fetchAwaitList({
                department_number: current_department.number,
                project: current_project,
                pin_code: pin_code,
                view_mode: view_mode.key,
            }))
        }

    }, [pin_code, current_department, await_list_updated, dispatch, current_project, view_mode.key])

    return (
        <div className="col p-1 m-0 w-50"
             style={{
                 height: "93vh", overflow: "auto", overflowX: "hidden", overflowY: "auto",
                 borderLeftWidth: "4px", borderLeftStyle: "solid"
             }}
        >
            <StickyHeader loading={await_list_is_loading}>Список изделий в очереди</StickyHeader>

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