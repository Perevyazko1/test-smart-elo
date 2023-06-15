import React, {memo, useCallback, useEffect, useState} from 'react';
import {useSelector} from "react-redux";

import {eqActions, getCurrentViewMod, getSeriesSize} from "pages/EQPage";
import {classNames, Mods} from "shared/lib/classNames/classNames";
import {Slider} from "shared/ui/Slider/Slider";
import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";
import {IndicatorWrapper} from "shared/ui/IndicatorWrapper/IndicatorWrapper";
import {order_product} from "entities/OrderProduct";
import {EmployeePermissions, getEmployeeAuthData, getEmployeeHasPermissions} from "entities/Employee";

import {CardContentWrapper} from "./CardContentWrapper/CardContentWrapper";
import {fetchUpdateAssignments} from "../model/services/fetchUpdateAssignments";
import cls from './OrderProductCard.module.scss'
import {createImageUrls} from "../lib/createImageUrls";
import {getButtonIcon} from "../lib/getButtonIcon";
import {getButtonBg} from "../lib/getButtonBg";
import {getButtonAction} from "../lib/getButtonAction";
import {createNumberLists} from "../lib/createNumberLists";
import {setTargetNumber} from "../lib/setTargetNumber";
import {updateTargetData} from "../lib/updateTargetList";
import {OrderProductInfo} from "../../OrderProductInfo";

export enum CardType {
    AWAIT_CARD = 'await',
    IN_WORK_CARD = 'in_work',
    READY_CARD = 'ready',
}

interface OrderProductCardProps {
    card_type: CardType
    order_product: order_product
    disabled?: boolean
    className?: string
}

export const OrderProductCard = memo((props: OrderProductCardProps) => {
    const {card_type, className, order_product, disabled = false, ...otherProps} = props

    const dispatch = useAppDispatch()
    const authData = useSelector(getEmployeeAuthData)
    const view_mode = useSelector(getCurrentViewMod)
    const series_size = useSelector(getSeriesSize)
    const confirmAssignment = useSelector(getEmployeeHasPermissions([
        EmployeePermissions.ELO_CONFIRM_ASSIGNMENT
    ]))

    const [assignmentsLists, setAssignmentsLists] = useState(createNumberLists(order_product, series_size))
    const [showCardInfo, setShowCardInfo] = useState(false)

    const tech_process_not_changed = !order_product?.product?.technological_process
    const sliderImages = createImageUrls(order_product)

    const showCardInfoWidget = useCallback(() => {
        setShowCardInfo(true)
    }, [])

    const hide_card_info = useCallback(() => {
        setShowCardInfo(false)
    }, [])

    const buttonIcon = useCallback((first: boolean = true) => {
        return getButtonIcon(first, card_type)
    }, [card_type])

    const buttonBg = useCallback((first: boolean = true) => {
        return getButtonBg(first, card_type, order_product)
    }, [card_type, order_product])

    const buttonAction = useCallback((first: boolean) => {
        return getButtonAction(first, card_type)
    }, [card_type])

    const assignmentConfirmed = useCallback((assignment_number: number) => {
        return order_product.assignments.filter(
            assignment => assignment.number === assignment_number && assignment.inspector
        ).length > 0
    }, [order_product.assignments])

    const set_target_number = (assignment_number: number) => {
        if (assignmentConfirmed(assignment_number) || !assignment_number) {
            return false;
        }
        dispatch(eqActions.setSeriesSize(1))
        // @ts-ignore
        setAssignmentsLists(setTargetNumber(
            assignmentsLists.primary,
            assignmentsLists.secondary,
            assignmentsLists.confirmed,
            assignment_number,
        ))
    }

    const show_first_button = useCallback(() => {
        if (assignmentsLists?.primary?.length > 0) {
            if (card_type !== CardType.READY_CARD) {
                return true;
            } else if (tech_process_not_changed) {
                return false;
            } else if (confirmAssignment) {
                return true;
            }
        }
        return false;
    }, [assignmentsLists?.primary?.length, card_type, confirmAssignment, tech_process_not_changed])

    const updateAssignments = async (first: boolean = true) => {
        if (authData?.pin_code && authData?.current_department) {
            await dispatch(fetchUpdateAssignments({
                numbers: assignmentsLists.primary,
                department_number: authData.current_department.number,
                series_id: order_product.series_id,
                // @ts-ignore
                action: buttonAction(first),
                pin_code: authData.pin_code,
                view_mode: view_mode.key,
            }))

            updateTargetData(first, card_type, dispatch, order_product)
        }
    }

    useEffect(() => {
        setAssignmentsLists(createNumberLists(order_product, series_size))
    }, [order_product, series_size])


    const mods: Mods = {
        [cls.card_active]: order_product.assignments.length > 0,
        [cls.card_disabled]: order_product.assignments.length === 0
    };

    return (
        <div
            className={classNames('card bg-dark mt-1 p-1', mods, [className])}
            {...otherProps}
        >
            {showCardInfo && <OrderProductInfo onHide={hide_card_info} order_product={order_product}/>}

            <div
                className="card-body d-flex m-0 p-0"
                style={{borderRadius: "6px"}}
            >
                {show_first_button() &&
                    <CardContentWrapper width={"50px"} className={'me-1'}>
                        <button
                            className={buttonBg() + " btn link-dark border rounded border-2 border-dark d-flex justify-content-xl-center align-items-xl-center"}
                            type="button" style={{width: "39px", height: "90px"}}
                            onClick={() => updateAssignments()}
                            disabled={disabled}
                        >
                            {buttonIcon()}
                        </button>
                    </CardContentWrapper>
                }


                <CardContentWrapper width={"100px"} className={'me-1'}>
                    <Slider price={order_product.tariff} images={sliderImages} width={'100%'} height={'100%'}/>
                </CardContentWrapper>

                <IndicatorWrapper indicator={'tech-process'}
                                  show={tech_process_not_changed}
                                  className={'bg-danger'}
                >
                    <CardContentWrapper
                        width={"90px"}
                        className={'me-1'}
                        onClick={showCardInfoWidget}
                    >
                        <h1 className="fw-bold m-0 p-0 pb-1" style={{fontSize: "12px"}}>
                            Всего:{order_product.count_all}
                        </h1>
                        <hr className="m-0 p-0" style={{color: "var(--bs-black)"}}/>
                        <h1 className="fw-bold m-0 p-0 py-1" style={{fontSize: "12px"}}>
                            В раб:{order_product.count_in_work}
                        </h1>
                        <hr className="m-0 p-0" style={{color: "var(--bs-black)"}}/>
                        <h1 className="fw-bold m-0 p-0 py-1" style={{fontSize: "12px"}}>
                            Своб:{order_product.count_await}
                        </h1>
                        <hr className="m-0 p-0" style={{color: "var(--bs-black)"}}/>
                        <h1 className="fw-bold m-0 p-0 pt-1" style={{fontSize: "12px"}}>
                            Готово:{order_product.count_ready}
                        </h1>
                    </CardContentWrapper>
                </IndicatorWrapper>

                <CardContentWrapper flexFill>
                    <div style={{height: "50%"}}>
                        <h1 className="fs-6 fw-bold h-100 m-0 p-0" style={{overflow: "auto", overflowY: "auto"}}>
                            {order_product.product.name}
                        </h1>
                        <hr className="m-0 p-0" style={{color: "var(--bs-black)"}}/>
                    </div>

                    <div className="d-flex" style={{height: "55%"}}>
                        <div
                            className="d-flex w-50 h-100 m-0 p-0 align-items-center"
                            style={{overflow: "auto", overflowY: "hidden", borderRightStyle: "ridge"}}
                        >
                            {assignmentsLists.primary?.map((number) => (
                                <button
                                    className={`btn btn-primary me-1`}
                                    type="button"
                                    key={number}
                                    onClick={() => set_target_number(number)}
                                >
                                    {number}
                                </button>
                            ))}
                            {assignmentsLists.secondary?.map((number) => (
                                <button
                                    className={`btn btn-secondary me-1`}
                                    type="button"
                                    key={number}
                                    onClick={() => set_target_number(number)}
                                >
                                    {number}
                                </button>
                            ))}
                            {assignmentsLists.confirmed?.map((number) => (
                                <button
                                    className={'btn btn-success me-1'}
                                    type="button"
                                    key={number}
                                >
                                    {number}
                                </button>
                            ))}
                        </div>

                        <div
                            className="d-xl-flex align-items-top w-50 pt-1"
                            style={{overflow: "auto", overflowY: "auto", overflowX: "hidden"}}
                        >
                            <div className="fw-bold text-center m-0 p-0"
                                 style={{width: "85px", fontSize: "14px"}}
                            >
                                Заказ: {order_product.series_id}
                            </div>
                            <div
                                className="fw-bold text-center m-0 p-0"
                                style={{overflow: "auto", overflowY: "auto", overflowX: "hidden", fontSize: "14px"}}
                            >
                                {order_product.order.project}
                            </div>
                        </div>

                    </div>
                </CardContentWrapper>

                {(card_type !== CardType.AWAIT_CARD && assignmentsLists?.primary?.length !== 0) &&
                    <CardContentWrapper width={"50px"} className={"ms-1"}>
                        <button
                            className={buttonBg(false) + " btn link-dark border rounded border-2 border-dark d-flex justify-content-xl-center align-items-xl-center"}
                            type="button" style={{width: "39px", height: "90px"}}
                            onClick={() => updateAssignments(false)}
                            disabled={disabled}
                        >
                            {buttonIcon(false)}
                        </button>
                    </CardContentWrapper>
                }
            </div>
        </div>
    );
});