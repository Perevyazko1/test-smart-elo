import {IndicatorWrapper} from "@shared/ui";
import {useAppDispatch, useAppModal} from "@shared/hooks";

import cls from "./EqCard.module.scss";

import {EqInfo, eqPageActions, useCardHeight} from "@pages/EqPage";
import {EqOrderProduct} from "@widgets/EqCardList";


interface CardCounterProps {
    card: EqOrderProduct;
}

export const CardCounter = (props: CardCounterProps) => {
    const {card} = props;

    const {handleOpen} = useAppModal();

    const dispatch = useAppDispatch();

    const openModalWithInfo = () => {
        handleOpen(
            <EqInfo card={card} updCallback={
                () => dispatch(eqPageActions.addNotRelevantId(card.id))
            }/>
        )
    };

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
                    <div className={
                        (card.card_info.count_all === 0 ? 'text-muted ' : '' ) + cls.infoItem
                    }
                    >
                        <span>Всего:</span>
                        <span>{card.card_info.count_all}</span>

                    </div>
                    <hr className={cls.contentHr}/>

                    <div className={
                        (card.card_info.count_in_work === 0 ? 'text-muted ' : '') + cls.infoItem
                    }>
                        <span>В раб:</span>
                        <span>{card.card_info.count_in_work}</span>
                    </div>
                    <hr className={cls.contentHr}/>

                    <div className={
                        (card.card_info.count_await === 0 ? 'text-muted ' : '') + cls.infoItem
                    }>
                        <span>Своб:</span>
                        <span>{card.card_info.count_await}</span>
                    </div>
                    <hr className={cls.contentHr}/>

                    <div className={
                        (card.card_info.count_ready === 0 ? 'text-muted ' : '') + cls.infoItem
                    }>
                        <span>Готов:</span>
                        <span>{card.card_info.count_ready}</span>
                    </div>
                </IndicatorWrapper>
            </IndicatorWrapper>
        </div>
    );
};
