import React, {memo, useCallback, useEffect, useState} from 'react';
import {useSelector} from "react-redux";
import {Button, Col} from "react-bootstrap";

import {eq_card} from "entities/EqPageCard";
import {EmployeePermissions, getEmployeeHasPermissions} from "entities/Employee";
import {classNames, Mods} from "shared/lib/classNames/classNames";
import {IndicatorWrapper} from "shared/ui/IndicatorWrapper/IndicatorWrapper";
import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";
import {Slider} from "shared/ui/Slider/Slider";

import cls from "./EqDesktopCard.module.scss";
import {Actions, fetchEqUpdateCard} from "../../../../../model/service/apiDesktop/fetchEqUpdateCard";
import {createEqImageUrls} from "../../model/lib/createEqImageUrls/createEqImageUrls";
import {createEqNumberLists} from "../../model/lib/createEqNumberLists/createEqNumberLists";
import {EqCardButton} from "../EqCardButton/EqCardButton";
import {getSeriesSize} from "../../../../../model/selectors/filtersSelectors/filtersSelectors";
import {eqFiltersActions} from "../../../../../model/slice/eqFiltersSlice";
import {setTargetNumber} from "../../model/lib/setTargetNumber/setTargetNumber";
import {OrderProductInfo} from "../../../OrderProductInfo";


interface EqCardProps {
    blockWidth: number;
    eqCard: eq_card;
    cardType: 'await' | 'in_work' | 'ready';
    className?: string
}


export const EqDesktopCard = memo((props: EqCardProps) => {
    const {
        blockWidth,
        eqCard,
        cardType,
        className,
    } = props

    const dispatch = useAppDispatch();
    const sliderImages = createEqImageUrls(eqCard);
    const seriesSize = useSelector(getSeriesSize);
    const [assignmentsLists, setAssignmentsLists] = useState(createEqNumberLists(eqCard, seriesSize));
    const [showCardInfo, setShowCardInfo] = useState(false)

    const [cardDisabled, setCardDisabled] = useState(false)
    const confirmAssignment = useSelector(getEmployeeHasPermissions([
        EmployeePermissions.ELO_CONFIRM_ASSIGNMENT
    ]))
    const getAction = (first: boolean) => {
        if (cardType === 'await') {
            return Actions.AWAIT_TO_IN_WORK
        } else if (cardType === 'in_work' && first) {
            return Actions.IN_WORK_TO_READY
        } else if (cardType === 'in_work' && !first) {
            return Actions.IN_WORK_TO_AWAIT
        } else if (cardType === 'ready' && first) {
            return Actions.CONFIRMED
        } else {
            return Actions.READY_TO_IN_WORK
        }
    }

    const getButtonCallback = (first: boolean) => {
        setCardDisabled(true)
        dispatch(fetchEqUpdateCard({
            series_id: eqCard.series_id,
            numbers: assignmentsLists.primary,
            action: getAction(first),
        })).then(() => {
            setCardDisabled(false);
        })
    };

    const setNumber = (assignment_number: number) => {
        setAssignmentsLists(setTargetNumber(
            assignmentsLists.primary,
            assignmentsLists.secondary,
            assignmentsLists.confirmed,
            assignment_number)
        )
        dispatch(eqFiltersActions.setSeriesSize(1))
    }

    useEffect(() => {
        setAssignmentsLists(createEqNumberLists(eqCard, seriesSize))
    }, [eqCard, seriesSize])

    const showFirstButton = useCallback(() => {
        if (blockWidth > 600) {
            if (assignmentsLists?.primary?.length > 0) {
                if (cardType !== 'await') {
                    if (!eqCard?.product?.technological_process) {
                        return false;
                    } else if (confirmAssignment) {
                        return true;
                    }
                } else {
                    return true;
                }
            }
        }
        return false;
    }, [assignmentsLists?.primary?.length, blockWidth, cardType, confirmAssignment, eqCard?.product?.technological_process])

    const showSecondButton = useCallback(() => {
        if (blockWidth > 600) {
            if (cardType === 'await') {
                return false;
            }
            if (assignmentsLists?.primary?.length > 0) {
                return true;
            }
        }
        return false;
    }, [assignmentsLists?.primary?.length, blockWidth, cardType])

    const mods: Mods = {
        'border border-secondary border-1 rounded h-100': true
    };

    const cardActive: Mods = {
        'unscaled': eqCard.assignments.length > 0,
        'scaled': eqCard.assignments.length === 0,
    }

    return (
        <Col sm={blockWidth > 2000 ? 6 : 12} className={classNames(cls.cardCol, cardActive, [className])}>
            {showCardInfo && <OrderProductInfo onHide={() => setShowCardInfo(false)} order_product={eqCard}/>}

            <div className={classNames(cls.card, {}, ['bg-dark rounded'])}>
                <div className={classNames(cls.overflowWrapper, {}, ['bg-dark rounded'])}>

                    {showFirstButton() &&
                        <EqCardButton
                            mods={mods}
                            cardType={cardType}
                            first={true}
                            onClick={() => getButtonCallback(true)}
                            urgency={eqCard.urgency}
                            isDisabled={cardDisabled}
                        />
                    }

                    <div
                        className={classNames(cls.sliderBlock, mods, [])}
                    >
                        <Slider price={eqCard.card_info.tariff} images={sliderImages} width={'100%'} height={'100%'}/>
                    </div>

                    <IndicatorWrapper indicator={'tech-process'}
                                      show={!eqCard?.product?.technological_process}
                                      className={'bg-danger'}
                    >
                        <div
                            className={classNames(cls.countBlock, mods, ['fs-7'])}
                            onClick={() => setShowCardInfo(true)}
                        >
                            <div className={eqCard.card_info.count_all === 0 ? 'text-muted' : ''}>
                                Всего:{eqCard.card_info.count_all}
                            </div>
                            <hr className={cls.contentHr}/>
                            <div className={eqCard.card_info.count_in_work === 0 ? 'text-muted' : ''}>
                                В_раб:{eqCard.card_info.count_in_work}
                            </div>
                            <hr className={cls.contentHr}/>

                            <div className={eqCard.card_info.count_await === 0 ? 'text-muted' : ''}>
                                Своб:{eqCard.card_info.count_await}
                            </div>
                            <hr className={cls.contentHr}/>

                            <div className={eqCard.card_info.count_ready === 0 ? 'text-muted' : ''}>
                                Готов:{eqCard.card_info.count_ready}
                            </div>
                        </div>
                    </IndicatorWrapper>

                    <div
                        className={classNames(cls.nameNumberBlock, mods, [])}
                    >
                        <div className={classNames(cls.productName, {}, [])}>
                            {eqCard.product.name}
                        </div>

                        <hr className={cls.contentHr}/>

                        <div className={cls.numbers}>
                            {assignmentsLists.primary?.map((number) => (
                                <Button
                                    key={number}
                                    className={classNames(cls.number, {}, ["fs-5 fw-bold"])}
                                    variant={'primary'}
                                >
                                    {number}
                                </Button>
                            ))}
                            {assignmentsLists.secondary?.map((number) => (
                                <Button
                                    key={number}
                                    className={classNames(cls.number, {}, ["fs-5 fw-bold"])}
                                    variant={'secondary'}
                                    onClick={() => setNumber(number)}
                                >
                                    {number}
                                </Button>
                            ))}
                            {assignmentsLists.confirmed?.map((number) => (
                                <Button
                                    key={number}
                                    className={classNames(cls.number, {}, ["fs-5 fw-bold"])}
                                    variant={'success'}
                                >
                                    {number}
                                </Button>
                            ))}
                        </div>
                    </div>


                    {blockWidth > 600 &&
                        <div className={classNames(cls.orderProjectBlock, mods, ['fs-7'])}>
                            <div>
                                Заказ:
                                <br/>
                                {eqCard.series_id}
                                <hr className={cls.contentHr}/>
                            </div>
                            <div>
                                Проект:
                                <br/>
                                {eqCard.order.project}
                            </div>
                        </div>
                    }

                    {blockWidth > 900 &&
                        <div className={classNames(cls.departmentInfoBlock, mods, ['fs-7'])}>
                            {eqCard.department_info.map((info) => (
                                <div
                                    className={classNames(cls.countInfo, {}, [`${info.count_in_work === 0 ? 'text-muted' : ''}`])}
                                    key={info.full_name}
                                >
                                    {info.full_name}: {info.count_in_work}
                                    <hr className={cls.contentHr}/>
                                </div>
                            ))}
                        </div>
                    }


                    {showSecondButton() &&
                        <EqCardButton
                            mods={mods}
                            cardType={cardType}
                            first={false}
                            onClick={() => getButtonCallback(false)}
                            urgency={eqCard.urgency}
                            isDisabled={cardDisabled}
                        />
                    }
                </div>
            </div>
        </Col>
    );
});
