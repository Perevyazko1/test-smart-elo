import React, {memo, useCallback, useEffect, useState} from 'react';
import {useSelector} from "react-redux";
import {Col} from "react-bootstrap";

import {eq_card} from "entities/EqPageCard";
import {EmployeePermissions, getEmployeeHasPermissions} from "entities/Employee";
import {classNames, Mods} from "shared/lib/classNames/classNames";
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
import {EqCardCounts} from "../EqCardCounts/EqCardCounts";
import {EqCardNumbers} from "../EqCardNumbers/EqCardNumbers";


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


    const [cardDisabled, setCardDisabled] = useState(false)
    const confirmAssignment = useSelector(getEmployeeHasPermissions([
        EmployeePermissions.ELO_CONFIRM_ASSIGNMENT
    ]))
    const getAction = useCallback((first: boolean) => {
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
    }, [cardType])

    const getButtonCallback = (first: boolean) => {
        setCardDisabled(true)
        dispatch(fetchEqUpdateCard({
            series_id: eqCard.series_id,
            numbers: assignmentsLists.primary,
            action: getAction(first),
        })).then(() => {
            setCardDisabled(false);
            if (getAction(first) === Actions.CONFIRMED) {
                dispatch(eqFiltersActions.weekDataHasUpdated())
            }
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
                if (cardType === 'in_work' || cardType === 'await') {
                    return true;
                }
                if (!eqCard?.product?.technological_process) {
                    return false;
                } else if (confirmAssignment) {
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

    const wrapper = 'border border-secondary border-1 rounded h-100'

    const cardActive: Mods = {
        'unscaled': eqCard.assignments.length > 0,
        'scaled': eqCard.assignments.length === 0,
    }

    return (
        <Col sm={blockWidth > 2000 ? 6 : 12} className={classNames(cls.cardCol, cardActive, [className])}>

            <div className={classNames(cls.card, {}, ['bg-dark rounded'])}>
                <div className={classNames(cls.overflowWrapper, {}, ['bg-dark rounded'])}>

                    {showFirstButton() &&
                        <EqCardButton
                            cardType={cardType}
                            first={true}
                            onClick={() => getButtonCallback(true)}
                            urgency={eqCard.urgency}
                            isDisabled={cardDisabled}
                        />
                    }

                    <div
                        className={classNames(cls.sliderBlock, {}, [wrapper])}
                    >
                        <Slider price={eqCard.card_info.tariff} images={sliderImages} width={'100%'} height={'100%'}/>
                    </div>

                    <EqCardCounts eqCard={eqCard} className={wrapper}/>


                    <div
                        className={classNames(cls.nameNumberBlock, {}, [wrapper])}
                    >
                        <div className={classNames(cls.productName, {}, [])}>
                            {eqCard.product.name}
                        </div>

                        <hr className={cls.contentHr}/>

                        <EqCardNumbers
                            callback={(number) => setNumber(number)}
                            assignmentsLists={assignmentsLists}
                        />
                    </div>

                    {blockWidth > 600 &&
                        <div className={classNames(cls.orderProjectBlock, {}, ['fs-7', wrapper])}>
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
                        <div className={classNames(cls.departmentInfoBlock, {}, ['fs-7', wrapper])}>
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
                            cardType={cardType}
                            first={false}
                            onClick={() => getButtonCallback(false)}
                            urgency={eqCard.urgency}
                            isDisabled={cardDisabled}
                            className={wrapper}
                        />
                    }
                </div>
            </div>
        </Col>
    );
});
