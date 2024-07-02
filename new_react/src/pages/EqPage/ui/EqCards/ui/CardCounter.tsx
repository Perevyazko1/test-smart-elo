import React, {useCallback} from "react";

import {IndicatorWrapper} from "@shared/ui";
import {useAppDispatch, useAppModal} from "@shared/hooks";

import cls from "./EqCard.module.scss";

import {eqPageActions} from "../../../model/slice/eqPageSlice";
import {useCardHeight} from "../../../model/lib/useCardHeight";

import {EqInfo} from "../../EqInfo/EqInfo";
import {EqOrderProduct} from "@pages/EqPage/model/types";


interface CardCounterProps {
    card: EqOrderProduct;
}

export const CardCounter = (props: CardCounterProps) => {
    const {card} = props;

    const {openModal} = useAppModal();

    const dispatch = useAppDispatch();

    const openModalWithInfo = useCallback(() => {
        openModal({
                content: (
                    <EqInfo card={card} updCallback={
                        () => dispatch(eqPageActions.addNotRelevantId(card.series_id))
                    }/>
                )
            }
        )
    }, [card, dispatch, openModal]);

    // Получаем высоту карточки
    const cardHeight = useCardHeight();

    return (
        <div
            className={cls.cardCounts + ' fs-7 fw-bold rounded'}
            onClick={openModalWithInfo}
        >
            <IndicatorWrapper
                indicator={'comment'}
                show={!!card.order.comment_base || !!card.order.comment_case}
                color={' bg-warning'}
                top={`${cardHeight - 17}px`}
            >
                <IndicatorWrapper
                    indicator={'tech-process'}
                    show={!card.product.technological_process}
                    color={' bg-danger'}
                    top={`${!!card.order.comment_base || !!card.order.comment_case ? cardHeight - 25 : cardHeight - 17}px`}
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
    );
};
