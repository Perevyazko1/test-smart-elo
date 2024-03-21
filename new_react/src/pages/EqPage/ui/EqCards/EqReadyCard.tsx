import React, {HTMLAttributes, memo, useCallback, useEffect, useMemo, useState} from "react";

import cls from "./EqCard.module.scss";

import {useAppDispatch, useAppModal, useAppQuery, useCompactMode, useCurrentUser, usePermission} from "@shared/hooks";
import {AppSlider, IndicatorWrapper} from "@shared/ui";

import {createEqNumberLists} from "../../model/lib/createEqNumberLists";
import {setTargetNumber} from "../../model/lib/setTargetNumber";
import {EqCardType} from "../../model/types/eqCardType";
import {useCardHeight} from "../../model/lib/useCardHeight";
import {createEqImageUrls} from "../../model/lib/createEqImageUrls";
import {Actions, fetchEqUpdCard} from "../../model/api/fetchEqUpdCard";

import {EqCardBtn} from "./EqCardBtn";
import {EqNumbers} from "./EqNumbers";
import {EqInfo} from "@pages/EqPage/ui/EqInfo/EqInfo";
import {eqPageActions} from "@pages/EqPage";
import {APP_PERM} from "@shared/consts";
import {AssignmentInfo} from "@widgets/AssignmentInfo";

interface EqReadyCardProps extends HTMLAttributes<HTMLDivElement> {
    card: EqCardType;
}

// Карточка блока ожидания
export const EqReadyCard = memo((props: EqReadyCardProps) => {
    const {card, ...otherProps} = props;
    const dispatch = useAppDispatch();

    // Поднимаем хук для вызова модалки с контентом
    const {openModal} = useAppModal();
    const {currentUser} = useCurrentUser();
    const {queryParameters, setQueryParam} = useAppQuery();

    const visaPerm = usePermission(APP_PERM.ELO_CONFIRM_ASSIGNMENT)

    const [cardDisabled, setCardDisabled] = useState(false);

    const {isCompactMode} = useCompactMode();
    // Получаем высоту карточки
    const cardHeight = useCardHeight();

    const sliderWidth = useMemo(() => {
        if (isCompactMode) {
            return '72px';
        } else {
            return '100px';
        }
    }, [isCompactMode]);

    const sliderImages = createEqImageUrls(card);

    const getAction = (first: boolean) => {
        return first ? Actions.CONFIRMED : Actions.READY_TO_IN_WORK
    }

    const [
        assignmentsLists,
        setAssignmentsLists
    ] = useState(createEqNumberLists(card.assignments, Number(queryParameters.series_size) || 1));

    const setNumber = (assignment_number: number) => {
        setAssignmentsLists(setTargetNumber(
            assignmentsLists.primary,
            assignmentsLists.secondary,
            assignmentsLists.confirmed,
            assignment_number)
        )
        setQueryParam('series_size', '')
    }

    useEffect(() => {
        setAssignmentsLists(createEqNumberLists(card.assignments, Number(queryParameters.series_size) || 1))
    }, [card.assignments, queryParameters.series_size])

    const getBtnClb = (first: boolean) => {
        setCardDisabled(true)
        dispatch(fetchEqUpdCard({
            series_id: card.series_id,
            department_number: currentUser.current_department.number,
            numbers: assignmentsLists.primary,
            action: getAction(first),
            variant: "desktop",
            ...queryParameters,
        })).then(() => {
            setCardDisabled(false);
        })
    };

    const getScaled = useCallback(() => {
        return card.assignments.length !== 0 ? 'unscaled' : "scaled"
    }, [card.assignments.length]);

    const openModalWithInfo = useCallback(() => {
        openModal(
            <EqInfo card={card} updCallback={
                () => dispatch(eqPageActions.addNotRelevantId(card.series_id))
            }/>
        )
    }, [card, dispatch, openModal]);

    return (
        <div className={'mt-1 pb-05'} {...otherProps} style={{height: `${cardHeight}px`}}>
            <div className={cls.overflowWrapper + ` bg-black rounded rounded-2 ${getScaled()}`}>
                {assignmentsLists.primary.length > 0 && !!card.product.technological_process && visaPerm &&
                    <EqCardBtn
                        style={{minWidth: '39px', maxWidth: '39px'}}
                        cardType={"ready"}
                        first={true}
                        urgency={card.urgency}
                        onClick={() => getBtnClb(true)}
                        disabled={cardDisabled}
                    />
                }

                {/*slider*/}
                <div className={cls.sliderBlock + ' bg-light rounded'} style={{
                    width: sliderWidth,
                    minWidth: sliderWidth,
                    maxWidth: sliderWidth,
                }}
                     onClick={() => openModal(
                         <AppSlider
                             images={sliderImages.images}
                             width={'90vw'}
                             height={'90vh'}
                         />
                     )}
                >
                    <AppSlider
                        images={sliderImages.thumbnails}
                        width={'100%'}
                        height={'100%'}
                        price={currentUser.current_department.piecework_wages ? card.card_info.tariff : undefined}
                        date={card.order.planned_date?.slice(-5)}
                    />
                </div>

                {/*counts*/}
                <div
                    className={cls.cardCounts + ' fs-7 fw-bold rounded'}
                    onClick={openModalWithInfo}
                >
                    <IndicatorWrapper
                        indicator={'comment'}
                        show={!!card.comment_base || !!card.comment_case}
                        color={' bg-warning'}
                        top={`${cardHeight - 17}px`}
                    >
                        <IndicatorWrapper
                            indicator={'tech-process'}
                            show={!card.product.technological_process}
                            color={' bg-danger'}
                            top={`${!!card.comment_base || !!card.comment_case ? cardHeight - 25 : cardHeight - 17}px`}
                        >
                            <div>
                                Всего:{card.card_info.count_all}
                            </div>
                            <hr className={cls.contentHr}/>
                            <div>
                                В_раб:{card.card_info.count_in_work}
                            </div>
                            <hr className={cls.contentHr}/>

                            <div>
                                Своб:{card.card_info.count_await}
                            </div>
                            <hr className={cls.contentHr}/>

                            <div className={'text-muted'}>
                                Готов:{card.card_info.count_ready}
                            </div>
                        </IndicatorWrapper>
                    </IndicatorWrapper>
                </div>

                {/*Имя и номера бегунков*/}
                <div className={cls.nameNumberBlock + ' bg-light rounded'}>
                    <div className={cls.productName}>
                        {card.product.name}
                        {/*{Math.ceil(Math.random() * 100)}*/}
                    </div>

                    <hr className={'m-0 p-0'}/>

                    <div className={cls.numbersBlock}>
                        <EqNumbers assignmentsLists={assignmentsLists} setNumber={setNumber}/>
                    </div>
                </div>

                {/*Заказ-Проект блок*/}
                <div className={cls.orderProjectBlock + ' rounded'}
                     style={{
                         fontSize: '14px',
                         backgroundColor: currentUser.current_department.color || "#ffffff"
                     }}
                >
                    <div className={'fs-7 fw-bold text-center'}>
                        Заказ:
                        <br/>
                        {card.series_id}
                        <hr className={'m-0 p-0'}/>
                    </div>
                    <div className={'fs-7 text-center'}>
                        Проект:
                        <br/>
                        {card.order.project}
                    </div>
                </div>

                <div
                    className={cls.depInfoBlock + ' bg-light rounded fs-7 fw-bold'}
                     onClick={() => openModal(
                         <AssignmentInfo seriesId={card.series_id} title={card.product.name}/>
                     )}
                >
                    {card.department_info.map((info, index) => (
                        <div key={index}>
                            {info.full_name} {info.count_in_work} ({info.count_all})
                            <hr className={'m-0 p-0'}/>
                        </div>
                    ))}
                </div>

                {assignmentsLists.primary.length > 0 &&
                    <EqCardBtn
                        style={{minWidth: '39px', maxWidth: '39px'}}
                        cardType={"ready"}
                        first={false}
                        urgency={card.urgency}
                        onClick={() => getBtnClb(false)}
                        disabled={cardDisabled}
                    />
                }
            </div>
        </div>
    );
});
