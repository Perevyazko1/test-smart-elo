import React, {memo, useCallback, useState} from 'react';
import {Button, Card, Col} from "react-bootstrap";

import {eq_card} from "entities/EqPageCard";
import {OpModal} from "features/OpInfo";
import {Slider} from "shared/ui/Slider/Slider";
import {classNames, Mods} from "shared/lib/classNames/classNames";

import {NumbersBlock} from "./NumbersBlock/NumbersBlock";
import {createEqImageUrls} from "../../model/lib/createEqImageUrls/createEqImageUrls";
import {distributeAssignments} from "../../model/lib/distributeAssignments/distributeAssignments";

import cls from "./EqMobileCard.module.scss";
import {IndicatorWrapper} from "../../../../../../../shared/ui/IndicatorWrapper/IndicatorWrapper";


interface EqMobileCardProps {
    eqCard: eq_card;
}

export const EqMobileCard = memo((props: EqMobileCardProps) => {
    const {
        eqCard,
    } = props;

    const [cardDisabled, setCardDisabled] = useState(false)
    const [showInfo, setShowInfo] = useState(false);
    const [showCardInfo, setShowCardInfo] = useState(false);
    const sliderImages = createEqImageUrls(eqCard);
    const sortedAssignments = distributeAssignments(eqCard.assignments);

    const wrapperStyle: Mods = {
        'bg-dark border rounded border-secondary': true,
    };

    const getCardIsActive = useCallback(() => {
        return eqCard.assignments.some(assignment => assignment.inspector === null);
    }, [eqCard.assignments])

    const cardActive: Mods = {
        'unscaled': getCardIsActive(),
        'scaled': !getCardIsActive(),
    }

    const getVariantByUrgency = () => {
        switch (eqCard.urgency) {
            case 1:
                return "danger";
            case 2:
                return "warning";
            case 3:
                return "success";
            case 4:
                return "secondary";
            default:
                return "success";
        }
    }


    return (
        <Card
            className={classNames('', cardActive, ['bg-dark bg-gradient'])}
        >
            <Card.Body className={'p-1'}>
                <div className={'d-flex mb-1'}>
                    <div
                        className={classNames(
                            cls.sliderWrapper,
                            wrapperStyle,
                            ["d-flex align-items-end me-xl-1"]
                        )}
                    >
                        <Slider price={eqCard.card_info.tariff} images={sliderImages} width={'100%'} height={'100%'}/>
                    </div>

                    <div
                        className={classNames(
                            cls.nameProjectWrapper,
                            wrapperStyle,
                            ["flex-fill m-0 p-0 ms-1 px-1"]
                        )}
                    >
                        <div className={
                            classNames(
                                cls.projectNameWrapper,
                                {},
                                ['d-flex justify-content-evenly align-items-center']
                            )}
                        >
                            <p className="fw-bold text-start text-light d-flex flex-fill pb-0 mb-0">
                                Серия: {eqCard.series_id}
                                <br/>
                                Проект:
                                {eqCard.order.project}
                            </p>
                        </div>

                        <hr className={cls.cardHr}/>

                        <div className={cls.projectNameWrapper}>
                            <p className="fw-bold text-start text-light d-flex flex-fill pb-0 mb-0">
                                {eqCard.product.name}
                            </p>
                        </div>

                    </div>
                </div>

                <div className={classNames('', wrapperStyle, ['p-1'])}>
                    <div className={classNames('', {}, ['d-flex justify-content-between'])}>
                        <IndicatorWrapper indicator={'tech-process'}
                                          show={!eqCard?.product?.technological_process}
                                          className={'bg-danger'}
                        >
                            <div
                                className={classNames(cls.countBlock, {}, ["text-white mb-0 py-1 pt-0 pb-0"])}>

                                <div className={'d-flex'}>

                                    <div className={eqCard.card_info.count_all === 0 ? 'text-muted' : ''}>
                                        Всего: {eqCard.card_info.count_all}
                                    </div>
                                    <div className={'mx-1'}> |</div>
                                    <div className={eqCard.card_info.count_await === 0 ? 'text-muted' : ''}>
                                        Доступно: {eqCard.card_info.count_await}
                                    </div>

                                </div>

                                <div className={'d-flex'}>
                                    <div className={eqCard.card_info.count_in_work === 0 ? 'text-muted' : ''}>
                                        В работе: {eqCard.card_info.count_in_work}
                                    </div>
                                    <div className={'mx-1'}> |</div>
                                    <div className={eqCard.card_info.count_ready === 0 ? 'text-muted' : ''}>
                                        Готово: {eqCard.card_info.count_ready}
                                    </div>
                                </div>
                            </div>
                        </IndicatorWrapper>

                        <div className={classNames(
                            cls.departmentInfoBlock,
                            wrapperStyle,
                            ["flex-fill d-none d-sm-block d-md-block d-lg-block mb-0 me-2 p-1 pt-0 pb-0"])}
                        >
                            {eqCard.department_info.map((info) => (
                                <Col
                                    md={6}
                                    sm={12}
                                    className={classNames(cls.countInfo, {}, [`${info.count_in_work === 0 ? 'text-muted' : ''}`])}
                                    key={info.full_name}
                                >
                                    {info.full_name}: {info.count_in_work}
                                </Col>
                            ))}
                        </div>

                        <Button
                            variant={getVariantByUrgency()}
                            size={'sm'}
                            className="text-center d-flex align-items-center my-2 px-2 me-1 mt-2"
                            type="button"
                            onClick={() => setShowInfo(!showInfo)}
                        >
                            {showInfo
                                ? <i className="fas fa-chevron-up fs-3"/>
                                : <i className="fas fa-chevron-down fs-3"/>
                            }

                        </Button>
                    </div>

                    {
                        showInfo &&
                        <>
                            <NumbersBlock
                                eqCard={eqCard}
                                setCardDisabled={(disable) => setCardDisabled(disable)}
                                setShowCardInfo={() => setShowCardInfo(true)}
                                disabled={cardDisabled}
                                assignments={sortedAssignments.await}
                                blockType={'await'}
                            />
                            <NumbersBlock
                                eqCard={eqCard}
                                setCardDisabled={(disable) => setCardDisabled(disable)}
                                disabled={cardDisabled}
                                assignments={sortedAssignments.in_work}
                                blockType={'in_work'}
                            />
                            <NumbersBlock
                                eqCard={eqCard}
                                setCardDisabled={(disable) => setCardDisabled(disable)}
                                disabled={cardDisabled}
                                assignments={sortedAssignments.ready}
                                blockType={'ready'}
                            />
                        </>
                    }

                </div>

            </Card.Body>

            {showCardInfo && <OpModal onHide={() => setShowCardInfo(false)} eqCard={eqCard}/>}
        </Card>
    );
});